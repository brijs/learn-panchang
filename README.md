# Panchang with Chandra 🌙

An animated, interactive guide to the Hindu calendar (Panchang): tithi, vara, nakshatra, yoga and karana, guided by Chandra the Moon.

**Live:** https://brijs.github.io/learn-panchang/

- A narrated tour in 13 short chapters, plus 10 optional deep dives (the sky as a 3D sphere, precession, eclipses, sidereal vs synodic month and more)
- 3D sky built with Three.js, with real Sun, Moon and planet positions for any date, time and place
- **Today's Panchang** for any date: the five limbs, sunrise and sunset, Rahu Kalam and traditional meanings of the day
- Everything is drawn and synthesized in code: no stock images. The tabla is synthesized with Web Audio.

> Best viewed full screen on a computer.

## How it's built

`index.html` is a single self-contained file (Three.js, the code and the narration are all embedded).
It is generated from the sources in `src/`:

```bash
cd src
python3 build.py      # writes src/panchang.html, src/standalone.html and ../index.html
```

- `src/*.js` is the app: `astro.js` (astronomy), `core.js` (3D helpers, audio, voice), `scenes.js`, `deep.js`, `new_d*.js` and `planets.js` (chapters), `engine.js` (player, finder, menus) and `menu_map.js` (sections map)
- `src/shell2.html` is the page template and CSS
- `src/voice/` holds the pre-recorded narration clips, which are embedded at build time
- `src/voice-tools/` holds the script and lines used to generate the narration with edge-tts

Astronomy follows Meeus-style Sun and Moon series, JPL Keplerian elements for the planets and the Lahiri ayanamsa.
Traditional associations are shared as cultural context.

## Credits

Created by **Brijesh Shetty** · [github.com/brijs](https://github.com/brijs)
Built with Claude Opus 5.5.
