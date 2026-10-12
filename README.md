# PlayGround — Liquid Synth 1.0

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://omgithub.com).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://omgithub.com/Torchwood4201/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/Torchwood4201/PlayGround)

- 🎮 [Open the project](https://omgithub.com/Torchwood4201/PlayGround).
- ✨ [Remix this project](https://omgithub.com/?remix=Torchwood4201%2FPlayGround).
- 💻 [Explore the source](https://github.com/Torchwood4201/PlayGround).
- 🛠️ [Check build runs](https://github.com/Torchwood4201/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/Torchwood4201/PlayGround/issues).
- 👤 [Explore the creator's projects](https://omgithub.com/Torchwood4201).
- 🌍 [Create with OMGithub](https://omgithub.com).
<!-- omgithub:readme:end -->

## Liquid Synth 1.0

An application to generate audio frequencies using the Web Audio API. Users can start, stop, and control the volume and frequency of the tone with sliders. Imported from `liquid-synth.zip` (issue #1).

Features: polyphonic synth engine (piano/organ/guitar/flute + classic waves + noise), ADSR, effects pedalboard (filter, distortion, delay, vibrato, reverb, tremolo, chorus), piano keyboard, arpeggiator, MIDI player + AI MIDI generator, recorder, AI singer (optional Gemini key).

New panels (merged from community references, clean-room implementations):
- **XY vector scope** (inspired by [EvanWestermann/Oscillator](https://github.com/EvanWestermann/Oscillator)): Lissajous XY / WAVE display with RGB split, trails, Z-warp, trace offset, drift — fed by a stereo tap off the master compressor.
- **Music Theory** (tables adapted from [GuoChen018/piano-app](https://github.com/GuoChen018/piano-app)): scale selector (Major/Minor/Dorian/Mixolydian) with amber keyboard highlighting, diatonic chord cards with audition strum, 4-slot progression tray, `.mid` export.
- **Drum Machine** (contracts from [Revisto/drum-machine](https://github.com/Revisto/drum-machine) + [shiny-drum-machine](https://googlechromelabs.github.io/web-audio-samples/demos/shiny-drum-machine/)): 6-voice × 16-step sequencer (Kick/Snare/HiHat/Tom×3) with fully synthesized Web Audio voices — no samples, works offline. 3-state velocity, tempo 50–180, swing, per-voice pitch, lookahead scheduler, LED playhead, 3 demo beats, JSON save/load (drag-drop), `.mid` export. Runs through the pedalboard FX chain.

Desktop browser layout: 3-column glass/liquid UI, responsive down to mobile.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Optional: set `GEMINI_API_KEY` in `.env.local` for AI MIDI generation / AI singer
3. Run dev:
   `npm run dev`
4. Production build:
   `npm run build`
5. OMGithub preview:
   `bash start.sh` (builds `dist/` and serves on `$PORT`, default 3000)

View original in AI Studio: https://ai.studio/apps/c6c85004-fa31-4974-8948-db79cb005ae5
