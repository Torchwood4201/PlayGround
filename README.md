# Playback — A Century of Sound

A music streaming web app: vintage-styled player UI (`public/`) backed by an
Express API with YouTube Music search, albums, playlists, related tracks,
playable audio resolution (JioSaavn → YouTube fallback) and lyrics.

Run locally: `npm install && npm start` → http://localhost:8000
Preview: `bash start.sh` serves on `PORT` (default 3000).

How the pieces connect
- `public/app.js` → `/api/search`, `/api/album/:id`, `/api/playlist/:id`, `/api/related/:id` (YouTube Music)
- `public/app.js` → `/api/play/:id` (`routes/playback.js`: JioSaavn → `vendor/yt_music_api` fallback)
- `public/app.js` → `/api/lyrics/:id` (`routes/playback.js`: `vendor/yt_music_api` getLyrics)
- API docs (Swagger) at `/api-docs`, health check at `/health`.

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
