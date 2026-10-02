# Notes for Claude Code

- Source lives in `src/`. Never edit `index.html` by hand: it is generated. Run `cd src && python3 build.py` after any change.
- Build order (see build.py): data, core, scenes, planets, deep, new_d, new_d2, engine and menu_map are concatenated into the `/*APP*/` slot of shell2.html; astro.js goes into `/*ASTRO*/`; voice/*.mp3 are base64-embedded into `VOICE_DATA`.
- Rendering: Three.js r128 WebGL under a 2D overlay canvas with logical 1600x900 coordinates.
- Narration: voice clip keys are hashes of the cue text. Changing a cue's wording needs a new clip (voice-tools/generate_voice.py); otherwise it falls back to browser speech.
- Publishing: GitHub Pages serves `index.html` from `main` / root. Commit and push to deploy.
