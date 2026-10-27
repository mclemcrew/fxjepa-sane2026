/* Listening examples for the FX-JEPA companion site.
   Reads clips/manifest.json (a list of examples) and builds three paired players per example.
   */
(function () {
  "use strict";

  var root = document.getElementById("examples");
  var params = new URLSearchParams(window.location.search);
  var MANIFEST = "clips/manifest.json";

  var STEM_ORDER = ["vocals", "bass", "drums", "other"];
  // canonical effect order of the strip; keys are normalized names
  var EFFECT_ORDER = [
    ["hpf"], ["lowshelf"], ["peakeq", "peak"], ["highshelf"], ["lpf"],
    ["comp", "compressor"], ["saturation", "sat"], ["clipper", "clip"],
    ["delay"], ["reverb"], ["output", "out"]
  ];
  var ROWS = [
    { key: "dry", label: "Dry stems", hint: "summed, before our chain" },
    { key: "processed", label: "Processed version", hint: "the reference, true chain" },
    { key: "predicted", label: "FX-JEPA render", hint: "dry stems through the predicted settings" }
  ];

  var PLAY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
  var PAUSE_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>';

  var current = null; // the player that is playing now

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function link(href, text) {
    var a = el("a", null, text);
    if (/^https?:\/\//i.test(href || "")) {
      a.href = href;
      a.rel = "noopener";
    }
    return a;
  }

  function safePath(p) {
    // only relative paths inside clips/ are allowed for audio
    return typeof p === "string" && /^clips\/[A-Za-z0-9._\-\/]+$/.test(p) && p.indexOf("..") === -1 ? p : null;
  }

  // "CC BY 4.0" style short name from a creativecommons.org license URL, else the given name
  function licenseName(item) {
    var m = /creativecommons\.org\/licenses\/([a-z-]+)\/([0-9.]+)(?:\/([a-z]{2}))?/i.exec(item.license_url || "");
    if (m) return "CC " + m[1].toUpperCase() + " " + m[2] + (m[3] ? " " + m[3].toUpperCase() : "");
    return item.license || "a Creative Commons license";
  }

  function normEffect(name) {
    return String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function effectRank(name) {
    var n = normEffect(name);
    for (var i = 0; i < EFFECT_ORDER.length; i++) {
      if (EFFECT_ORDER[i].indexOf(n) !== -1) return i;
    }
    return EFFECT_ORDER.length;
  }

  var EFFECT_NAMES = { hpf: "high-pass", low_shelf: "low shelf", peak: "peak EQ", high_shelf: "high shelf", lpf: "low-pass",
                       comp: "compressor", sat: "saturation", clip: "clipper", delay: "delay", reverb: "reverb", out: "output" };
  function prettyEffect(name) {
    return EFFECT_NAMES[String(name)] || String(name).replace(/_/g, " ");
  }

  function fmtNum(v) {
    if (typeof v !== "number" || !isFinite(v)) return String(v);
    var a = Math.abs(v);
    if (a === 0) return "0";
    if (Number.isInteger(v) || a >= 100) return v.toFixed(0);
    if (a >= 10) return v.toFixed(1);
    if (a >= 1) return v.toFixed(2);
    return v.toPrecision(2);
  }

  var UNITS = { ms: "ms", db: "dB", hz: "Hz", khz: "kHz", s: "s" };

  function fmtParams(p) {
    if (!p || typeof p !== "object") return "";
    return Object.keys(p).map(function (k) {
      var m = /^(.*)_(ms|db|hz|khz|s)$/i.exec(k);
      var name = (m ? m[1] : k).replace(/_/g, " ");
      var unit = m ? " " + UNITS[m[2].toLowerCase()] : "";
      return name + " " + fmtNum(p[k]) + unit;
    }).join(", ");
  }

  // chain: {stem: [{effect, params}]} -> {stem: {effectName: params}}
  function indexChain(chain) {
    var out = {};
    if (!chain || typeof chain !== "object") return out;
    // accept {stem: [...]} and {stems: {stem: [...]}}
    if (chain.stems && typeof chain.stems === "object" && !Array.isArray(chain.stems)) chain = chain.stems;
    Object.keys(chain).forEach(function (stem) {
      var list = Array.isArray(chain[stem]) ? chain[stem] : [];
      out[stem] = {};
      list.forEach(function (fx) {
        if (fx && fx.effect != null) out[stem][String(fx.effect)] = fx.params || {};
      });
    });
    return out;
  }

  function stemOrder(stems) {
    return stems.sort(function (a, b) {
      var ia = STEM_ORDER.indexOf(a.toLowerCase()), ib = STEM_ORDER.indexOf(b.toLowerCase());
      ia = ia === -1 ? 99 : ia; ib = ib === -1 ? 99 : ib;
      return ia - ib || a.localeCompare(b);
    });
  }

  var RANGES = {};   // filled from clips/knob_ranges.json: {"peak.freq": {lo, hi, scale, unit}}
  var UNITS = { freq: " Hz", cutoff: " Hz", gain_db: " dB", threshold_db: " dB", drive_db: " dB", attack_ms: " ms",
                release_ms: " ms", time_ms: " ms", slope: " dB/oct" };
  function fmtVal(k, v) {
    if (typeof v !== "number") return String(v);
    if (k === "slope") return String(Math.round(v)) + UNITS[k];
    var a = Math.abs(v), d = a >= 100 ? 0 : a >= 10 ? 1 : 2;
    return v.toFixed(d) + (UNITS[k] || "");
  }
  function pos(r, v) {           // where a value sits on its knob's track, 0 to 1
    var x;
    if (r.scale === "log" && r.lo > 0 && v > 0) x = (Math.log(v) - Math.log(r.lo)) / (Math.log(r.hi) - Math.log(r.lo));
    else x = (v - r.lo) / (r.hi - r.lo);
    return Math.max(0, Math.min(1, x));
  }
  // one knob: its name, a track across the knob's full range with the true value (ink) and the predicted value
  // (orange) marked and the gap between them shaded, then the two numbers
  function knobRow(fx, k, tv, pv) {
    var r = RANGES[fx + "." + k];
    var row = el("div", "knob");
    row.appendChild(el("span", "kname", prettyParam(k)));
    var track = el("div", "track");
    if (r && r.choices) {
      r.choices.forEach(function (c) {
        var tag = el("span", "choice" + (tv === c ? " t" : "") + (pv === c ? " p" : ""), fmtVal(k, c));
        track.appendChild(tag);
      });
      track.className = "track choices";
    } else if (r && typeof tv === "number" && typeof pv === "number") {
      var a = pos(r, tv), bp = pos(r, pv);
      var gap = el("span", "gap"); gap.style.left = (Math.min(a, bp) * 100) + "%"; gap.style.width = (Math.abs(a - bp) * 100) + "%";
      var mt = el("span", "tick t"); mt.style.left = (a * 100) + "%"; mt.title = "true " + fmtVal(k, tv);
      var mpp = el("span", "tick p"); mpp.style.left = (bp * 100) + "%"; mpp.title = "predicted " + fmtVal(k, pv);
      track.appendChild(gap); track.appendChild(mt); track.appendChild(mpp);
    } else {
      track.className = "track none";
    }
    row.appendChild(track);
    var vals = el("span", "kvals");
    vals.appendChild(el("b", null, typeof tv === "number" ? fmtVal(k, tv) : "\u2014"));
    vals.appendChild(document.createTextNode(" "));
    vals.appendChild(el("i", null, typeof pv === "number" ? fmtVal(k, pv) : "\u2014"));
    row.appendChild(vals);
    return row;
  }

  var PARAM_NAMES = { gain_db: "gain", threshold_db: "threshold", attack_ms: "attack", release_ms: "release",
                      drive_db: "drive", time_ms: "time", room_size: "room size", q: "Q" };
  function prettyParam(k) { return PARAM_NAMES[k] || k; }

  function chainTable(item) {
    var t = indexChain(item.chain_true), p = indexChain(item.chain_pred);
    var stems = stemOrder(Object.keys(Object.assign({}, t, p)));
    var table = el("table", "chain-table");
    var thead = el("thead"), hr = el("tr");
    ["Stem", "Effect", "Knobs: true value in ink, predicted in orange, on the knob's full range"].forEach(function (h) { hr.appendChild(el("th", null, h)); });
    thead.appendChild(hr); table.appendChild(thead);
    var tbody = el("tbody");
    var agree = 0, total = 0;
    stems.forEach(function (stem) {
      var ts = t[stem] || {}, ps = p[stem] || {};
      var effects = Object.keys(Object.assign({}, ts, ps)).sort(function (a, b) {
        return effectRank(a) - effectRank(b) || a.localeCompare(b);
      });
      if (!effects.length) {
        var r0 = el("tr");
        r0.appendChild(el("td", "stem", stem));
        var c0 = el("td", "miss", "no effects on in either chain");
        c0.colSpan = 2; r0.appendChild(c0);
        tbody.appendChild(r0);
        return;
      }
      effects.forEach(function (fx, i) {
        var inT = Object.prototype.hasOwnProperty.call(ts, fx);
        var inP = Object.prototype.hasOwnProperty.call(ps, fx);
        total += 1; if (inT === inP) agree += 1;
        var tr = el("tr", inT === inP ? null : "switch-miss");
        tr.appendChild(el("td", "stem", i === 0 ? stem : ""));
        var fxCell = el("td", "fx");
        fxCell.appendChild(el("span", null, prettyEffect(fx)));
        if (inT !== inP) fxCell.appendChild(el("span", "params", inT ? "true on, predicted off" : "predicted on, true off"));
        tr.appendChild(fxCell);
        var kc = el("td", "knobs");
        var keys = Object.keys(Object.assign({}, ts[fx] || {}, ps[fx] || {}));
        keys.forEach(function (k) {
          kc.appendChild(knobRow(fx, k, inT ? (ts[fx] || {})[k] : undefined, inP ? (ps[fx] || {})[k] : undefined));
        });
        tr.appendChild(kc);
        tbody.appendChild(tr);
      });
    });
    table.appendChild(tbody);
    return { table: table, agree: agree, total: total };
  }

  function setPlaying(player, on) {
    player.btn.innerHTML = on ? PAUSE_ICON : PLAY_ICON;
    player.btn.setAttribute("aria-label", (on ? "Pause " : "Play ") + player.name);
    player.row.classList.toggle("playing", on);
  }

  function playerTime(pl) {
    if (pl.ws) return pl.ws.getCurrentTime();
    if (pl.audio) return pl.audio.currentTime;
    return 0;
  }

  function seek(pl, t) {
    if (pl.ws) {
      var d = pl.ws.getDuration();
      if (d > 0) pl.ws.setTime(Math.min(t, Math.max(0, d - 0.05)));
    } else if (pl.audio) {
      try { pl.audio.currentTime = t; } catch (e) { /* not loaded yet */ }
    }
  }

  function pause(pl) {
    if (pl.ws) pl.ws.pause(); else if (pl.audio) pl.audio.pause();
    setPlaying(pl, false);
  }

  function play(pl) {
    var r = pl.ws ? pl.ws.play() : pl.audio.play();
    if (r && typeof r.catch === "function") r.catch(function () { setPlaying(pl, false); });
    setPlaying(pl, true);
  }

  function toggle(pl) {
    if (pl.failed) return;
    if (current === pl) { pause(pl); current = null; return; }
    if (current) {
      // A/B: carry the position over when switching rows inside one example
      var t = current.group === pl.group ? playerTime(current) : null;
      pause(current);
      if (t != null) seek(pl, t);
    }
    current = pl;
    play(pl);
  }

  function fail(pl, msg) {
    pl.failed = true;
    pl.btn.disabled = true;
    setPlaying(pl, false);
    pl.wave.innerHTML = "";
    pl.wave.appendChild(el("div", "err", msg));
    if (current === pl) current = null;
  }

  function onEnd(pl) {
    setPlaying(pl, false);
    if (current === pl) current = null;
  }

  function mountPlayer(pl) {
    if (pl.mounted) return;
    pl.mounted = true;
    if (!pl.src) { fail(pl, "No audio file listed for this version."); return; }
    if (window.WaveSurfer && typeof window.WaveSurfer.create === "function") {
      var styles = getComputedStyle(document.documentElement);
      var accent = (styles.getPropertyValue("--orange") || "#e78d3c").trim();
      var ws = window.WaveSurfer.create({
        container: pl.wave,
        url: pl.src,
        height: 56,
        waveColor: pl.key === "predicted" ? "#edb576" : "#c9cacb",
        progressColor: pl.key === "predicted" ? accent : "#191919",
        cursorColor: accent,
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 1,
        normalize: false,
        dragToSeek: true
      });
      pl.ws = ws;
      ws.on("ready", function () {
        pl.btn.disabled = false;
        var d = ws.getDuration();
        pl.time.textContent = d ? d.toFixed(1) + " s" : "";
      });
      ws.on("error", function () { fail(pl, "Audio file not found: " + pl.src); });
      ws.on("finish", function () { onEnd(pl); });
      ws.on("interaction", function () {
        // clicking the waveform of another row in the same example moves the shared position
        if (current && current !== pl && current.group === pl.group) {
          var t = ws.getCurrentTime();
          pause(current); current = pl; seek(pl, t); play(pl);
        }
      });
    } else {
      // CDN blocked: fall back to the browser's own player
      var audio = el("audio");
      audio.controls = true;
      audio.preload = "metadata";
      audio.src = pl.src;
      audio.style.width = "100%";
      pl.audio = audio;
      pl.wave.appendChild(audio);
      pl.btn.disabled = false;
      audio.addEventListener("error", function () { fail(pl, "Audio file not found: " + pl.src); });
      audio.addEventListener("ended", function () { onEnd(pl); });
      audio.addEventListener("play", function () {
        if (current && current !== pl) pause(current);
        current = pl; setPlaying(pl, true);
      });
      audio.addEventListener("pause", function () { setPlaying(pl, false); if (current === pl) current = null; });
    }
  }

  function buildExample(item, idx) {
    var card = el("article", "example");
    card.id = "ex-" + String(item.id || idx).replace(/[^A-Za-z0-9_-]/g, "");

    var head = el("div", "example-head");
    var h = el("h3");
    h.appendChild(document.createTextNode(item.title || "Untitled"));
    if (item.artist) {
      h.appendChild(document.createTextNode(" "));
      h.appendChild(el("span", "artist", "by " + item.artist));
    }
    head.appendChild(h);
    if (typeof item.mrstft === "number" && isFinite(item.mrstft)) {
      var m = el("div", "score", "MRSTFT of this prediction");
      m.appendChild(el("b", null, item.mrstft.toFixed(3)));
      m.appendChild(el("span", "scale", " (0 = identical, 0.413 = model mean, 1.17 = dry unchanged)"));
      m.title = "Spectral error of the FX-JEPA render against the processed version, over 8 channels. Lower is better.";
      head.appendChild(m);
    }
    card.appendChild(head);

    var meta = el("p", "example-meta");
    meta.appendChild(document.createTextNode("“" + (item.title || "Untitled") + "” by " + (item.artist || "unknown artist") + ", licensed under "));
    if (item.license_url) {
      var la = link(item.license_url, licenseName(item));
      if (item.license) la.title = item.license;
      meta.appendChild(la);
    } else meta.appendChild(document.createTextNode(licenseName(item)));
    meta.appendChild(document.createTextNode(". "));
    if (item.fma_url) {
      meta.appendChild(link(item.fma_url, "Track page on the Free Music Archive"));
      meta.appendChild(document.createTextNode(". "));
    }
    meta.appendChild(document.createTextNode("Changes: excerpted, split into stems, processed through an effects chain, summed and level-matched."));
    card.appendChild(meta);

    var players = el("div", "players");
    var group = {};
    var list = [];
    ROWS.forEach(function (r) {
      var row = el("div", "player");
      var btn = el("button", "play");
      btn.type = "button";
      btn.disabled = true;
      var label = el("div", "label");
      var lt = el("span");
      lt.appendChild(el("b", null, r.label));
      lt.appendChild(document.createTextNode(", " + r.hint));
      var time = el("span");
      label.appendChild(lt); label.appendChild(time);
      var wave = el("div", "wave");
      row.appendChild(btn); row.appendChild(label); row.appendChild(wave);
      players.appendChild(row);
      var pl = { key: r.key, name: r.label + " of " + (item.title || "this example"), src: safePath(item[r.key]),
                 row: row, btn: btn, wave: wave, time: time, group: group };
      setPlaying(pl, false);
      btn.addEventListener("click", function () { toggle(pl); });
      list.push(pl);
    });
    card.appendChild(players);
    card.appendChild(el("p", "ab-hint", "Switch rows while playing to compare at the same moment."));

    var ct = chainTable(item);
    var det = el("details", "chain");
    var sum = el("summary", null, "True and predicted chain, per stem");
    det.appendChild(sum);
    if (ct.total) {
      if (item.listen_for) det.appendChild(el("p", "note", "Listen for: " + item.listen_for));
      det.appendChild(el("p", "note", "Switches agree on " + ct.agree + " of the " + ct.total +
        " effects that are on in either chain. Knob values are in each effect's own units."));
    }
    var wrap = el("div", "table-scroll");
    wrap.appendChild(ct.table);
    det.appendChild(wrap);
    card.appendChild(det);

    return { card: card, players: list };
  }

  function emptyState() {
    root.innerHTML = "";
    var box = el("div", "empty-state");
    box.appendChild(el("h2", null, "Examples are being prepared"));
    box.appendChild(el("p", null, "The listening examples will appear here shortly. They use Free Music Archive tracks whose Creative Commons licenses allow derivatives, with artist credit and a link back to each track."));
    var p = el("p", "note");
    p.appendChild(document.createTextNode("In the meantime, the "));
    var a = el("a", null, "results page"); a.href = "results.html";
    p.appendChild(a);
    p.appendChild(document.createTextNode(" has the measured numbers."));
    box.appendChild(p);
    root.appendChild(box);
  }

  function render(items) {
    root.innerHTML = "";
    var built = items.map(buildExample);
    built.forEach(function (b) { root.appendChild(b.card); });
    var mountCard = function (b) { b.players.forEach(mountPlayer); };
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var b = built.filter(function (x) { return x.card === e.target; })[0];
          if (b) mountCard(b);
          io.unobserve(e.target);
        });
      }, { rootMargin: "300px 0px" });
      built.forEach(function (b) { io.observe(b.card); });
    } else {
      built.forEach(mountCard);
    }
  }

  function valid(item) {
    return item && typeof item === "object" && (item.dry || item.processed || item.predicted);
  }

  // the knob ranges come first, so the chain tables can draw their tracks; a missing file only loses the tracks
  fetch("clips/knob_ranges.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; })
    .then(function (kr) { RANGES = kr || {}; }).catch(function () { RANGES = {}; })
    .then(function () { return fetch(MANIFEST, { cache: "no-cache" }); })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var items = Array.isArray(data) ? data.filter(valid) : [];
      if (!items.length) emptyState(); else render(items);
    })
    .catch(emptyState);
})();
