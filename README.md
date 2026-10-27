# FX-JEPA at SANE 2026

Companion website for the poster "FX-JEPA: Learning Effect-Aware Audio Representations for Reference-Based Audio Effect Transfer" by Michael Clemens, Oleksandr Tsymbalenko, Tim Stilson and Scott Van Duyne (Universal Audio), poster AM-10 at SANE 2026, MIT, 30 October 2026.

Live at https://mclemcrew.github.io/fxjepa-sane2026/ (GitHub Pages serves the `docs/` folder of this repository).

## What's here

| Page | What it shows |
|---|---|
| `index.html` | Title and authors, then the listening examples: dry stems, the processed version, and the render from FX-JEPA's predicted settings, with the true and predicted chains |
| `poster.html` | The poster (PNG, with a PDF download), the task and the main result, and what we do not claim |
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
  "mrstft": 0.156,
  "listen_for": "..."
}
```

`chain_true` and `chain_pred` may also be wrapped as `{"stems": {...}}`. If the manifest is missing or empty the page shows an "examples are being prepared" note. `listen_for` is one sentence per clip, built at build time from the two chains: the switch misses, then the largest knob misses.

## Run it locally

```
python3 -m http.server 8767 --bind 127.0.0.1
```

from this folder, then open http://127.0.0.1:8767/.

## Licenses

Site code is MIT; page text and figures are CC BY 4.0; the poster, the Universal Audio logo and the audio have their own terms, see `LICENSES.md`.

## Contact

Michael Clemens, mclemens@uaudio.com

## Licence

Site code (HTML, CSS, JavaScript): MIT. Page text and figures: CC BY 4.0, Michael Clemens, Universal Audio, 2026.
The poster PDF and PNG and the Universal Audio logo: copyright Universal Audio, all rights reserved. The listening
clips are excerpts of Free Music Archive tracks under their own Creative Commons licences; every one is credited in
`docs/LICENSES.md`. Public datasets and open-source effects only; no Universal Audio plugins, models or weights.
