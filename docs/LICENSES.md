# Licenses

This folder is the companion website for the SANE 2026 poster "FX-JEPA: Learning Effect-Aware Audio Representations for Reference-Based Audio Effect Transfer" (Michael Clemens, Oleksandr Tsymbalenko, Tim Stilson, Scott Van Duyne, Universal Audio). Different parts carry different licenses.

## Site code

The HTML, CSS and JavaScript (`*.html`, `assets/`) are released under the MIT License.

```
MIT License

Copyright (c) 2026 Michael Clemens

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Poster, figures and written text

The prose on the pages and the figures in `figures/` are released under the Creative Commons Attribution 4.0 licence (CC BY 4.0), Michael Clemens, Universal Audio, 2026; they are not covered by the MIT License. `poster.png` and `poster.pdf` are copyright 2026 Universal Audio, all rights reserved. The Universal Audio logo on the poster is a trademark of Universal Audio, Inc. and is not licensed for reuse.

## Third-party code

- [wavesurfer.js](https://wavesurfer.xyz/) 7.10.1, BSD 3-Clause License, loaded from cdnjs at page load. Not redistributed in this folder.

## Audio

Every clip in `clips/` is a 10-second excerpt of a [Free Music Archive](https://freemusicarchive.org/) track released under a Creative Commons license that allows derivatives (CC BY or CC BY-SA). The dry, processed and predicted versions are adaptations of the original recording. Changes made: excerpted, split into four stems, each stem processed through an effects chain and summed again, level-matched across the three versions of a clip, and encoded as MP3. Each clip keeps the license of its source track; the ShareAlike clips are shared under the same license as their source. No audio here comes from MoisesDB, MUSDB18 or Universal Audio.

The table below is filled from `clips/manifest.json` at build time.

| Clip | Track | Artist | License | FMA page |
|---|---|---|---|---|
| q0555 | simple | Orbique | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | https://freemusicarchive.org/music/Orbique/none_given_1578/17_-_orbique_-_simple_-_always_now_never_after/ |
| q0629 | Sia | Graham Bole | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/Graham_Bole/First_New_Day/Graham_Bole_-_02_-_Sia/ |
| q0969 | Brundlefly | The Zombie Dandies | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/Zombie_Dandies/Dandys_Little_Monsters/The_Zombie_Dandies_-_Dandys_Little_Monsters_-_11_Brundlefly/ |
| q0749 | Life is Too Dark to Laugh So Hard | DJ Dougernaut | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/DJ_Dougernaut/DJ_Dougernaut_Singles/Life_is_Too_Dark_to_Laugh_So_Hard/ |
| q0596 | Follow That | BrokeMC | [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/) | https://freemusicarchive.org/music/BrokeMC/Seeing_Things/Follow_That/ |
| q0867 | What You Know | Droopies | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/Droopies/Droopies/Droopies_-_Droopies_-_09_What_You_Know/ |
| q0124 | Big Plans (J. Glaze Remix) | Kellee Maize & J. Glaze Productions | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/Kellee_Maize__J_Glaze_Productions/The_Remixes/Big_Plans_J_Glaze_Remix/ |
| q0477 | Stop | Vienna Ditto | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | https://freemusicarchive.org/music/Vienna_Ditto/Ugly_1501/Vienna_Ditto_-_Ugly_-_03_Stop/ |
