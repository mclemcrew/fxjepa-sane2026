# FX-JEPA at SANE 2026

Companion website for the poster "FX-JEPA: Learning Effect-Aware Audio Representations for Reference-Based Audio Effect Transfer" by Michael Clemens, Oleksandr Tsymbalenko, Tim Stilson and Scott Van Duyne (Universal Audio), poster AM-10 at SANE 2026, MIT, 30 October 2026.

Live at https://mclemcrew.github.io/fxjepa-sane2026/ (GitHub Pages serves this `docs/` folder).

## What's here

| Page | What it shows |
|---|---|
| `index.html` | Title, authors, the poster (PNG, with a PDF download), the one-paragraph story and what we don't claim yet |
| `architecture.html` | The architecture figure and a plain-language walkthrough, the four published encoders we compare against, and answers to questions readers ask |
| `results.html` | MRSTFT for every model on 1,000 held-out clips, second runs and noise bounds, the FX-Encoder++ learning curve, knob skill, the 28-knob range and scoring table, how delay-time error is measured, caveats and how MRSTFT is computed |
| `listen.html` | Paired players: dry stems, processed version, and the render from FX-JEPA's predicted settings, with the true and predicted chains |

Plain HTML, CSS and JavaScript, no build step needed to serve. The only external script is wavesurfer.js 7.10.1 from cdnjs, on the listen page, with a fallback to the browser's own audio player if it doesn't load.

## Listening examples

`listen.html` reads `clips/manifest.json`, a list of entries like:

```json
{
  "id": "q0555",
  "title": "...", "artist": "...",
  "fma_track_id": 71302,
  "license": "...", "license_url": "https://creativecommons.org/...",
  "fma_url": "https://freemusicarchive.org/music/...",
  "dry": "clips/q0555_dry.mp3",
  "processed": "clips/q0555_wet.mp3",
  "predicted": "clips/q0555_pred.mp3",
  "chain_true": {"vocals": [{"effect": "hpf", "params": {"cutoff": 33.8}}]},
  "chain_pred": {"vocals": [{"effect": "hpf", "params": {"cutoff": 69.2}}]},
  "m8_pred": 0.156
}
```

`chain_true` and `chain_pred` may also be wrapped as `{"stems": {...}}`. If the manifest is missing or empty the page shows an "examples are being prepared" note. `listen.html?demo` loads `clips/manifest.example.json` (placeholder entries, no audio) to check the layout.

## Run it locally

```
python3 -m http.server 8767 --bind 127.0.0.1
```

from this folder, then open http://127.0.0.1:8767/.

## Licenses

Site code is MIT. The poster, figures and audio have their own terms; see `LICENSES.md`.

## Contact

Michael Clemens, mclemens@uaudio.com
