document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const STORAGE_KEY = 'mobius.settings.v2';
    const FAVORITES_KEY = 'mobius.favorites.v2';
    const MAX_PEAK_SIZE = 160 * 1024 * 1024;

    const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'flac', 'm4a', 'aac', 'ogg', 'oga', 'opus', 'weba', 'aiff', 'aif', 'wma']);
    const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mkv', 'mov', 'm4v', 'ogv', 'avi', 'wmv', 'flv']);

    const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    const EQ_PRESETS = {
        flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bass_boost: [6, 5, 3, 1, 0, -1, -1, 0, 0, 0],
        treble_boost: [0, 0, 0, -1, 0, 1, 3, 5, 6, 4],
        vocal: [-2, -1, 0, 2, 4, 5, 3, 1, 0, -1],
        rock: [4, 3, 2, 3, 2, 1, 4, 3, 2, 1],
        classical: [1, 1, 0, -1, 0, 1, 1, 1, 0, -1],
        pop: [5, 4, 2, 0, -2, -1, 2, 4, 5, 3],
        acoustic: [2, 1, 1, 3, 4, 2, 1, 0, -1, -2],
        hiphop: [7, 6, 4, 1, -1, 0, 1, 2, 4, 2],
        loudness: [3, 3, 2, 2, 1, 1, 2, 2, 1, 1]
    };
    const EQ_PRESET_LABELS = {
        flat: 'Flat response',
        bass_boost: 'Bass boost',
        treble_boost: 'Treble boost',
        vocal: 'Vocal presence',
        rock: 'Rock curve',
        classical: 'Classical curve',
        pop: 'Pop curve',
        acoustic: 'Acoustic curve',
        hiphop: 'Hip-hop curve',
        loudness: 'Loudness curve',
        custom: 'Custom curve'
    };
    const VISUALIZERS = ['Bars', 'Wave', 'Orbit'];
    const ACCENTS = ['cyan', 'violet', 'pink', 'lime', 'amber'];
    const REPEAT_LABELS = { off: 'Repeat off', all: 'Repeat all', one: 'Repeat one' };

    const DEFAULTS = {
        accent: 'cyan',
        volume: 0.8,
        muted: false,
        repeat: 'off',
        shuffle: false,
        visualizer: 0,
        speed: 1,
        view: 'list',
        sort: 'recent',
        eqPreset: 'flat',
        eqValues: Array(10).fill(50)
    };

    // DOM
    const fileInput = $('#file-input');
    const folderInput = $('#folder-input');
    const loadMediaBtn = $('#load-media-btn');
    const loadFolderBtn = $('#load-folder-btn');
    const loadUrlBtn = $('#load-url-btn');
    const urlModal = $('#url-modal');
    const urlForm = $('#url-form');
    const urlInput = $('#url-input');
    const urlError = $('#url-error');
    const urlSubmit = $('#url-submit');
    const dropzone = $('#dropzone');
    const dropOverlay = $('#drop-overlay');
    const globalSearch = $('#global-search');

    const libraryList = $('#library-list');
    const libraryScroll = $('#library-scroll');
    const libraryMeta = $('#library-meta');
    const sortSelect = $('#sort-select');
    const viewButtons = $$('.view-toggle button');
    const filterTabs = $('#filter-tabs');
    const filterButtons = $$('.filter-tabs button');

    const queueList = $('#queue-list');
    const queueCount = $('#queue-count');
    const queueDuration = $('#queue-duration');
    const queueNote = $('#queue-note');
    const clearQueueBtn = $('#btn-clear-queue');

    const videoPlayer = $('#main-player');
    const localAudio = $('#local-audio');
    const streamAudio = $('#stream-audio');
    const mediaElements = [videoPlayer, localAudio, streamAudio];
    let media = videoPlayer;
    const canvas = $('#visualizer-canvas');
    const waveformCanvas = $('#waveform-canvas');
    const viewport = $('#media-viewport');
    const playerPanel = $('#player-panel');
    const placeholder = $('#placeholder-logo');
    const remoteStage = $('#remote-stage');
    const remoteInitials = $('#remote-initials');
    const remoteTitle = $('#remote-title');
    const remoteHost = $('#remote-host');
    const youtubeStage = $('#youtube-stage');
    const youtubeFallback = $('#youtube-fallback');
    const youtubeFallbackTitle = $('#youtube-fallback-title');
    const youtubeFallbackText = $('#youtube-fallback-text');
    const youtubeOpen = $('#youtube-open');
    const visToast = $('#vis-toast');

    const playBtn = $('#btn-play');
    const playIcon = $('#play-icon');
    const prevBtn = $('#btn-prev');
    const nextBtn = $('#btn-next');
    const shuffleBtn = $('#btn-shuffle');
    const repeatBtn = $('#btn-repeat');
    const repeatBadge = $('#repeat-badge');
    const progressBar = $('#progress-bar');
    const currentTimeEl = $('#current-time');
    const durationTimeEl = $('#duration-time');
    const volumeSlider = $('#volume-slider');
    const muteBtn = $('#btn-mute');
    const volumeIcon = $('#volume-icon');
    const speedBtn = $('#btn-speed');
    const speedLabel = $('#speed-label');
    const sleepBtn = $('#btn-sleep');
    const sleepChip = $('#sleep-chip');

    const infoTitle = $('#info-title');
    const infoType = $('#info-type');
    const infoArtist = $('#info-artist');
    const infoStatus = $('#info-status');
    const coverArt = $('#cover-art');
    const coverInitials = $('#cover-initials');
    const favoriteBtn = $('#btn-favorite');
    const mediaBadge = $('#media-badge');
    const pipBtn = $('#btn-pip');
    const fullscreenBtn = $('#btn-fullscreen');
    const visualizerBtn = $('#btn-visualizer');
    const visualizerName = $('#visualizer-name');
    const visualizerHint = $('#visualizer-hint');
    const visualizerHintText = $('#visualizer-hint-text');
    const nextUpChip = $('#next-up-chip');
    const nextUpTitle = $('#next-up-title');

    const eqSliders = $$('.eq-slider');
    const eqPresetSelect = $('#eq-preset-select');
    const eqStatus = $('#eq-status');
    const eqResetBtn = $('#btn-eq-reset');

    const commandBtn = $('#btn-command');
    const commandModal = $('#command-modal');
    const commandInput = $('#command-input');
    const commandResults = $('#command-results');
    const shortcutsModal = $('#shortcuts-modal');
    const shortcutsBtn = $('#btn-shortcuts');
    const toastStack = $('#toast-stack');
    const accentBtn = $('#btn-accent');
    const ambientGlow = $('#ambient-glow');

    // State
    const saved = readSettings();
    const favorites = new Set(readJSON(FAVORITES_KEY, []));

    const state = {
        tracks: [],
        queue: [],
        currentId: null,
        filter: 'all',
        search: '',
        sort: saved.sort,
        view: saved.view,
        repeat: saved.repeat,
        shuffle: saved.shuffle,
        visualizer: saved.visualizer,
        speed: saved.speed,
        volume: saved.volume,
        muted: saved.muted,
        isPlaying: false,
        progress: 0,
        currentObjectURL: null,
        audioCtx: null,
        analyser: null,
        eqFilters: [],
        animationId: null,
        dragQueueId: null,
        dragCounter: 0,
        sleepEnd: null,
        sleepInterval: null,
        commands: [],
        commandIndex: 0,
        trackSeq: 0,
        resizeBound: false,
        youtubePlayer: null,
        youtubeApiPromise: null,
        youtubeActiveId: null,
        youtubeTimer: null,
        youtubeToken: 0,
        youtubeReady: false,
        youtubePending: null
    };

    const youtubeMedia = {
        get paused() {
            const playerState = getYouTubeState();
            return playerState !== 1 && playerState !== 3;
        },
        get ended() { return getYouTubeState() === 0; },
        get currentTime() {
            const player = state.youtubePlayer;
            if (!player || typeof player.getCurrentTime !== 'function') return 0;
            try { return player.getCurrentTime() || 0; } catch { return 0; }
        },
        set currentTime(value) {
            const player = state.youtubePlayer;
            if (!player || typeof player.seekTo !== 'function') return;
            try { player.seekTo(Math.max(0, Number(value) || 0), true); } catch { /* noop */ }
            updateTimeUI();
            updateSessionPosition();
        },
        get duration() {
            const player = state.youtubePlayer;
            if (!player || typeof player.getDuration !== 'function') return 0;
            try { return player.getDuration() || 0; } catch { return 0; }
        },
        get currentSrc() { return state.youtubeActiveId ? `youtube:${state.youtubeActiveId}` : ''; },
        get volume() { return state.volume; },
        set volume(value) { state.volume = clamp(Number(value) || 0, 0, 1); syncYouTubeVolume(); },
        get muted() { return state.muted; },
        set muted(value) { state.muted = Boolean(value); syncYouTubeVolume(); },
        get playbackRate() { return state.speed; },
        set playbackRate(value) { state.speed = clamp(Number(value) || 1, 0.25, 2); syncYouTubeSpeed(); },
        get defaultPlaybackRate() { return state.speed; },
        set defaultPlaybackRate(value) { /* applied through playbackRate */ },
        play() {
            playYouTube();
            return Promise.resolve();
        },
        pause() { pauseYouTube(); },
        load() { /* the IFrame API manages its own buffer */ }
    };

    function getYouTubeState() {
        const player = state.youtubePlayer;
        if (!player || typeof player.getPlayerState !== 'function') return -1;
        try { return player.getPlayerState(); } catch { return -1; }
    }

    // ---------- Utilities ----------
    function readJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function readSettings() {
        const value = readJSON(STORAGE_KEY, {});
        const merged = { ...DEFAULTS, ...(value && typeof value === 'object' ? value : {}) };
        if (!Array.isArray(merged.eqValues) || merged.eqValues.length !== 10) merged.eqValues = Array(10).fill(50);
        if (!ACCENTS.includes(merged.accent)) merged.accent = DEFAULTS.accent;
        if (!REPEAT_LABELS[merged.repeat]) merged.repeat = 'off';
        if (!['list', 'grid'].includes(merged.view)) merged.view = 'list';
        if (!['recent', 'title', 'artist', 'duration'].includes(merged.sort)) merged.sort = 'recent';
        if (!['flat', 'bass_boost', 'treble_boost', 'vocal', 'rock', 'classical', 'pop', 'acoustic', 'hiphop', 'loudness', 'custom'].includes(merged.eqPreset)) merged.eqPreset = 'flat';
        merged.visualizer = Number(merged.visualizer) || 0;
        merged.speed = Number(merged.speed) || 1;
        merged.volume = Number.isFinite(Number(merged.volume)) ? Math.min(1, Math.max(0, Number(merged.volume))) : 0.8;
        merged.muted = Boolean(merged.muted);
        merged.shuffle = Boolean(merged.shuffle);
        return merged;
    }

    function saveSettings() {
        const settings = {
            accent: document.body.dataset.accent,
            volume: state.volume,
            muted: state.muted,
            repeat: state.repeat,
            shuffle: state.shuffle,
            visualizer: state.visualizer,
            speed: state.speed,
            view: state.view,
            sort: state.sort,
            eqPreset: eqPresetSelect.value,
            eqValues: eqSliders.map(slider => Number(slider.value))
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch {
            /* storage can be unavailable in private contexts */
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
        } catch {
            /* ignore */
        }
    }

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function hashString(value) {
        let hash = 2166136261;
        for (let i = 0; i < value.length; i++) {
            hash ^= value.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return Math.abs(hash);
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function formatTime(seconds) {
        if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
        const total = Math.floor(seconds);
        const hours = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        if (hours > 0) return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function formatBytes(bytes) {
        if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
        if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        return `${Math.max(1, Math.round(bytes / (1024 * 1024)))} MB`;
    }

    function fileExtension(name) {
        const index = name.lastIndexOf('.');
        return index > -1 ? name.slice(index + 1).toLowerCase() : '';
    }

    function mediaKind(file) {
        if (file.type && file.type.startsWith('audio/')) return 'audio';
        if (file.type && file.type.startsWith('video/')) return 'video';
        const ext = fileExtension(file.name);
        if (VIDEO_EXTENSIONS.has(ext)) return 'video';
        if (AUDIO_EXTENSIONS.has(ext)) return 'audio';
        return 'audio';
    }

    function isMediaFile(file) {
        if (file.type && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) return true;
        const ext = fileExtension(file.name);
        return AUDIO_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
    }

    function trackKey(file) {
        return `${file.name}|${file.size}|${file.lastModified}`;
    }

    function initialsFor(track) {
        const source = (track.artist && !/^unknown/i.test(track.artist) ? track.artist : track.title).trim();
        const words = source.split(/\s+/).filter(Boolean);
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return source.slice(0, 2).toUpperCase() || 'MM';
    }

    function coverStyle(track) {
        return `--cover-h1:${track.hue1};--cover-h2:${track.hue2};`;
    }

    function getCurrentTrack() {
        return state.tracks.find(track => track.id === state.currentId) || null;
    }

    function getTrack(id) {
        return state.tracks.find(track => track.id === id) || null;
    }

    function toast(message, options = {}) {
        const { icon = 'fa-circle-check', tone = 'info', duration = 2600 } = options;
        const element = document.createElement('div');
        element.className = 'toast';
        element.dataset.tone = tone;
        const iconEl = document.createElement('i');
        iconEl.className = `fa-solid ${icon}`;
        const label = document.createElement('span');
        label.textContent = message;
        element.append(iconEl, label);
        toastStack.appendChild(element);
        requestAnimationFrame(() => element.classList.add('show'));
        window.setTimeout(() => {
            element.classList.remove('show');
            window.setTimeout(() => element.remove(), 260);
        }, duration);
    }

    // ---------- Track creation ----------
    function parseTrackName(baseName, defaultAlbum = 'Local library') {
        let title = baseName;
        let artist = 'Unknown artist';
        let album = defaultAlbum;
        const parts = baseName.split(/\s+[–—-]\s+/).map(part => part.trim()).filter(Boolean);
        if (parts.length === 2) {
            artist = parts[0];
            title = parts[1];
        } else if (parts.length >= 3) {
            artist = parts[0];
            album = parts[1];
            title = parts.slice(2).join(' - ');
        }
        return { title, artist, album };
    }

    function createTrack(file) {
        state.trackSeq += 1;
        const baseName = file.name.replace(/\.[^.]+$/, '').trim() || file.name;
        const parsed = parseTrackName(baseName);
        let { title, artist, album } = parsed;

        if (file.webkitRelativePath) {
            const segments = file.webkitRelativePath.split('/');
            if (segments.length > 1 && album === 'Local library') album = segments[segments.length - 2];
        }

        const kind = mediaKind(file);
        const seed = hashString(`${file.name}${file.size}`);
        const hue1 = seed % 360;
        const hue2 = (hue1 + 48 + (hashString(artist) % 90)) % 360;
        const ext = fileExtension(file.name).toUpperCase() || (kind === 'video' ? 'VIDEO' : 'AUDIO');

        return {
            id: `trk_${state.trackSeq}_${Date.now()}`,
            source: 'local',
            remote: false,
            file,
            url: null,
            host: null,
            title,
            artist,
            album,
            kind,
            ext,
            hue1,
            hue2,
            duration: null,
            addedAt: Date.now() + state.trackSeq,
            lastPlayed: null,
            favorite: favorites.has(trackKey(file)),
            peaks: null,
            coverData: null
        };
    }

    function favoriteKey(track) {
        return track.remote ? track.url : trackKey(track.file);
    }

    function normalizeRemoteUrl(raw) {
        let value = String(raw || '').trim();
        if (!value) throw new Error('Paste a media URL first.');
        if (value.startsWith('//')) value = `${window.location.protocol}${value}`;
        else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = `https://${value}`;
        let parsed;
        try { parsed = new URL(value); } catch { throw new Error('That does not look like a valid URL.'); }
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Only http:// and https:// links are supported.');
        parsed.hash = '';
        if (window.location.protocol === 'https:' && parsed.protocol === 'http:') {
            throw new Error('This page is served over HTTPS, so it cannot load an insecure http:// stream.');
        }
        return parsed;
    }

    function remoteLabel(parsed) {
        const decode = value => { try { return decodeURIComponent(value); } catch { return value; } };
        const segments = parsed.pathname.split('/').filter(Boolean);
        let candidate = segments.length ? decode(segments[segments.length - 1]) : parsed.hostname;
        let ext = fileExtension(candidate);
        if (!AUDIO_EXTENSIONS.has(ext) && !VIDEO_EXTENSIONS.has(ext)) {
            for (const value of parsed.searchParams.values()) {
                const valueExt = fileExtension(value.split(/[?#]/)[0]);
                if (AUDIO_EXTENSIONS.has(valueExt) || VIDEO_EXTENSIONS.has(valueExt)) {
                    candidate = value;
                    ext = valueExt;
                    break;
                }
            }
        }
        return {
            name: candidate.replace(/\.[^.]+$/, '').trim() || parsed.hostname,
            ext
        };
    }

    function inspectRemoteMedia(url) {
        return new Promise((resolve, reject) => {
            const probe = document.createElement('video');
            let settled = false;
            probe.preload = 'metadata';
            probe.muted = true;
            probe.playsInline = true;
            probe.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';

            const finish = (callback, value) => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                probe.removeAttribute('src');
                try { probe.load(); } catch { /* noop */ }
                probe.remove();
                callback(value);
            };

            const timer = window.setTimeout(() => {
                finish(reject, new Error('That URL took too long to respond.'));
            }, 12000);

            probe.addEventListener('loadedmetadata', () => {
                const kind = (probe.videoWidth > 0 || probe.videoHeight > 0) ? 'video' : 'audio';
                finish(resolve, {
                    kind,
                    duration: Number.isFinite(probe.duration) && probe.duration > 0 ? probe.duration : null
                });
            }, { once: true });
            probe.addEventListener('error', () => {
                finish(reject, new Error('That link did not load as playable audio or video.'));
            }, { once: true });

            probe.src = url;
            document.body.appendChild(probe);
        });
    }

    function createRemoteTrack(parsed, info) {
        state.trackSeq += 1;
        const label = remoteLabel(parsed);
        const parsedName = parseTrackName(label.name, 'Remote link');
        const seed = hashString(parsed.href);
        const hue1 = seed % 360;
        const hue2 = (hue1 + 48 + (hashString(parsedName.artist) % 90)) % 360;
        const kind = info.kind;
        const ext = label.ext.toUpperCase() || (kind === 'video' ? 'VIDEO' : 'STREAM');

        return {
            id: `trk_${state.trackSeq}_${Date.now()}`,
            source: 'url',
            remote: true,
            file: null,
            url: parsed.href,
            host: parsed.hostname,
            title: parsedName.title,
            artist: parsedName.artist,
            album: parsedName.album,
            kind,
            ext,
            hue1,
            hue2,
            duration: info.duration,
            addedAt: Date.now() + state.trackSeq,
            lastPlayed: null,
            favorite: favorites.has(parsed.href),
            peaks: null,
            coverData: null
        };
    }

    function parseYouTubeTime(value) {
        const raw = String(value || '').trim();
        if (!raw) return 0;
        if (/^\d+$/.test(raw)) return Number(raw);
        const match = raw.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
        if (!match) return 0;
        return (Number(match[1]) || 0) * 3600 + (Number(match[2]) || 0) * 60 + (Number(match[3]) || 0);
    }

    function parseYouTubeUrl(parsed) {
        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        const youtubeHosts = new Set([
            'youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be',
            'youtube-nocookie.com', 'youtubekids.com'
        ]);
        if (!youtubeHosts.has(host)) return null;

        let id = '';
        if (host === 'youtu.be') {
            id = parsed.pathname.split('/').filter(Boolean)[0] || '';
        } else if (parsed.pathname === '/watch' || parsed.pathname === '/watch/') {
            id = parsed.searchParams.get('v') || '';
        } else {
            const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)/);
            if (match) id = match[1];
        }

        const startValue = parsed.searchParams.get('t')
            || parsed.searchParams.get('start')
            || parsed.searchParams.get('time_continue');
        return {
            id: /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null,
            start: parseYouTubeTime(startValue)
        };
    }

    function createYouTubeTrack(yt) {
        state.trackSeq += 1;
        const url = `https://www.youtube.com/watch?v=${yt.id}`;
        const seed = hashString(yt.id);
        const hue1 = seed % 360;
        const hue2 = (hue1 + 48 + (hashString('YouTube') % 90)) % 360;

        return {
            id: `trk_${state.trackSeq}_${Date.now()}`,
            source: 'youtube',
            remote: true,
            youtubeId: yt.id,
            start: yt.start,
            file: null,
            url,
            host: 'youtube.com',
            title: 'YouTube video',
            artist: 'YouTube',
            album: 'YouTube',
            kind: 'video',
            ext: 'YOUTUBE',
            hue1,
            hue2,
            duration: null,
            addedAt: Date.now() + state.trackSeq,
            lastPlayed: null,
            favorite: favorites.has(url),
            peaks: null,
            coverData: null
        };
    }

    function commitRemoteTrack(track, message) {
        state.tracks.push(track);
        state.queue.push(track.id);
        if (!state.currentId) loadTrack(track.id, true);
        else renderAll();
        closeModal(urlModal);
        urlForm.reset();
        toast(message, { icon: track.source === 'youtube' ? 'fa-circle-play' : 'fa-link' });
    }

    async function addRemoteUrl(raw) {
        if (urlSubmit.disabled) return false;
        urlError.textContent = '';
        let parsed;
        try {
            parsed = normalizeRemoteUrl(raw);
        } catch (error) {
            urlError.textContent = error.message;
            return false;
        }

        const youtube = parseYouTubeUrl(parsed);
        if (youtube && !youtube.id) {
            urlError.textContent = 'That YouTube link does not include a playable 11-character video ID.';
            return false;
        }

        if (youtube) {
            const existing = state.tracks.find(track => track.remote && track.youtubeId === youtube.id);
            if (existing) {
                closeModal(urlModal);
                loadTrack(existing.id, true);
                toast('Already in your library — playing it now', { icon: 'fa-link' });
                return true;
            }
            const track = createYouTubeTrack(youtube);
            commitRemoteTrack(track, 'YouTube video added to your library');
            return true;
        }

        const existing = state.tracks.find(track => track.remote && !track.youtubeId && track.url === parsed.href);
        if (existing) {
            closeModal(urlModal);
            loadTrack(existing.id, true);
            toast('Already in your library — playing it now', { icon: 'fa-link' });
            return true;
        }

        const originalLabel = urlSubmit.innerHTML;
        urlSubmit.disabled = true;
        urlSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> Checking…';

        try {
            const info = await inspectRemoteMedia(parsed.href);
            const track = createRemoteTrack(parsed, info);
            commitRemoteTrack(track, `Remote ${track.kind} added to your library`);
            return true;
        } catch (error) {
            urlError.textContent = error.message || 'That link could not be added.';
            return false;
        } finally {
            urlSubmit.disabled = false;
            urlSubmit.innerHTML = originalLabel;
        }
    }

    // ---------- YouTube player ----------
    function loadYouTubeApi() {
        if (window.YT && typeof window.YT.Player === 'function') return Promise.resolve(window.YT);
        if (state.youtubeApiPromise) return state.youtubeApiPromise;

        state.youtubeApiPromise = new Promise((resolve, reject) => {
            let settled = false;
            let script = null;
            const previousReady = window.onYouTubeIframeAPIReady;

            const finish = (callback, value) => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timer);
                if (callback === reject) {
                    state.youtubeApiPromise = null;
                    if (script && script.parentNode) script.remove();
                }
                callback(value);
            };

            const timer = window.setTimeout(() => {
                finish(reject, new Error('YouTube took too long to respond.'));
            }, 12000);

            window.onYouTubeIframeAPIReady = () => {
                if (typeof previousReady === 'function') {
                    try { previousReady(); } catch { /* ignore */ }
                }
                if (window.YT && typeof window.YT.Player === 'function') finish(resolve, window.YT);
                else finish(reject, new Error('The YouTube player could not be initialized.'));
            };

            script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.dataset.youtubeApi = 'true';
            script.onerror = () => finish(reject, new Error('The YouTube player script could not be loaded.'));
            document.head.appendChild(script);
        });

        return state.youtubeApiPromise;
    }

    async function ensureYouTubePlayer() {
        if (state.youtubePlayer) return state.youtubePlayer;
        const YT = await loadYouTubeApi();
        if (state.youtubePlayer) return state.youtubePlayer;

        const playerVars = {
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            playsinline: 1,
            modestbranding: 1,
            enablejsapi: 1
        };
        if (/^https?:$/.test(window.location.protocol)) playerVars.origin = window.location.origin;

        state.youtubePlayer = new YT.Player('youtube-player', {
            width: '100%',
            height: '100%',
            playerVars,
            events: {
                onReady: onYouTubeReady,
                onStateChange: onYouTubeStateChange,
                onError: onYouTubeError
            }
        });
        return state.youtubePlayer;
    }

    function onYouTubeReady() {
        state.youtubeReady = true;
        syncYouTubeVolume();
        syncYouTubeSpeed();

        const pending = state.youtubePending;
        if (!pending || pending.token !== state.youtubeToken) return;
        if (state.currentId !== pending.id || media !== youtubeMedia) return;

        state.youtubePending = null;
        try {
            state.youtubePlayer.loadVideoById({ videoId: pending.videoId, startSeconds: pending.start || 0 });
        } catch {
            showYouTubeFallback('This YouTube video could not be loaded.', getCurrentTrack());
        }
    }

    function onYouTubeStateChange(event) {
        const track = getCurrentTrack();
        if (!track || track.source !== 'youtube' || media !== youtubeMedia) return;
        const playerState = event.data;

        if (playerState === 1) {
            state.isPlaying = true;
            updatePlayIcon(true);
            setStatus('Playing', 'playing');
            updateSessionState();
            syncYouTubeMetadata();
            syncYouTubeDuration();
            startYouTubeTimer();
            renderLibrary();
        } else if (playerState === 3) {
            state.isPlaying = true;
            updatePlayIcon(true);
            setStatus('Buffering', 'loading');
            updateSessionState();
            syncYouTubeMetadata();
            startYouTubeTimer();
        } else if (playerState === 2) {
            state.isPlaying = false;
            updatePlayIcon(false);
            setStatus('Paused', 'paused');
            updateSessionState();
            syncYouTubeDuration();
            stopYouTubeTimer();
            renderLibrary();
        } else if (playerState === 0) {
            state.isPlaying = false;
            updatePlayIcon(false);
            setStatus('Ended', 'stopped');
            updateSessionState();
            stopYouTubeTimer();
            renderLibrary();
            playNext(false);
        } else if (playerState === 5) {
            syncYouTubeMetadata();
            syncYouTubeDuration();
            if (media.paused) updatePlayIcon(false);
        }
    }

    function onYouTubeError(event) {
        const track = getCurrentTrack();
        if (!track || track.source !== 'youtube') return;
        const messages = {
            2: 'That YouTube video ID is invalid.',
            5: 'The YouTube player encountered an HTML5 playback error.',
            100: 'This YouTube video is unavailable.',
            101: 'This video cannot be embedded here. Open it on YouTube instead.',
            150: 'This video cannot be played here. It may be restricted or unavailable in this browser.'
        };
        showYouTubeFallback(messages[event.data] || 'This YouTube video could not be played.', track);
    }

    function showYouTubeFallback(message, track) {
        stopYouTubeTimer();
        state.youtubePending = null;
        state.isPlaying = false;
        updatePlayIcon(false);
        setStatus('Unavailable', 'error');
        youtubeFallback.hidden = false;
        youtubeStage.hidden = false;
        youtubeFallbackTitle.textContent = 'YouTube video unavailable';
        youtubeFallbackText.textContent = message;
        if (track && track.youtubeId) youtubeOpen.href = `https://www.youtube.com/watch?v=${track.youtubeId}`;
        toast(message, { icon: 'fa-triangle-exclamation', tone: 'danger' });
        renderLibrary();
    }

    async function loadYouTubeTrack(track) {
        const token = ++state.youtubeToken;
        stopYouTubeTimer();
        state.youtubeActiveId = track.id;
        state.youtubePending = null;
        youtubeFallback.hidden = true;
        setStatus('Loading', 'loading');

        try {
            const player = await ensureYouTubePlayer();
            if (token !== state.youtubeToken || state.currentId !== track.id || media !== youtubeMedia) return;

            syncYouTubeVolume();
            syncYouTubeSpeed();
            const request = {
                token,
                id: track.id,
                videoId: track.youtubeId,
                start: track.start || 0
            };

            if (state.youtubeReady && typeof player.loadVideoById === 'function') {
                player.loadVideoById({ videoId: request.videoId, startSeconds: request.start });
            } else {
                state.youtubePending = request;
            }
        } catch (error) {
            if (token !== state.youtubeToken || state.currentId !== track.id) return;
            showYouTubeFallback(error.message || 'The YouTube player could not be loaded.', track);
        }
    }

    function playYouTube() {
        const track = getCurrentTrack();
        if (!track || track.source !== 'youtube') return;
        if (!state.youtubePlayer || !state.youtubeReady) {
            if (!state.youtubePending || state.youtubePending.id !== track.id) loadYouTubeTrack(track);
            return;
        }
        syncYouTubeVolume();
        try { state.youtubePlayer.playVideo(); } catch { /* noop */ }
    }

    function pauseYouTube() {
        if (!state.youtubePlayer || !state.youtubeReady) return;
        try { state.youtubePlayer.pauseVideo(); } catch { /* noop */ }
    }

    function stopYouTube() {
        stopYouTubeTimer();
        state.youtubeToken += 1;
        state.youtubeActiveId = null;
        state.youtubePending = null;
        youtubeFallback.hidden = true;
        if (state.youtubePlayer && state.youtubeReady) {
            try { state.youtubePlayer.pauseVideo(); } catch { /* noop */ }
        }
    }

    function syncYouTubeVolume() {
        if (!state.youtubePlayer || !state.youtubeReady) return;
        try {
            state.youtubePlayer.setVolume(Math.round(state.volume * 100));
            if (state.muted) state.youtubePlayer.mute();
            else state.youtubePlayer.unMute();
        } catch { /* noop */ }
    }

    function syncYouTubeSpeed() {
        if (!state.youtubePlayer || !state.youtubeReady) return;
        try { state.youtubePlayer.setPlaybackRate(clamp(state.speed, 0.25, 2)); } catch { /* noop */ }
    }

    function syncYouTubeDuration() {
        const track = getCurrentTrack();
        if (!track || track.source !== 'youtube') return;
        const duration = media.duration;
        if (Number.isFinite(duration) && duration > 0 && duration !== track.duration) {
            track.duration = duration;
            updateDurationLabels(track.id);
            updateLibraryMeta(visibleTracks());
            updateQueueMeta();
            updatePlayerInfo();
        }
        updateTimeUI();
    }

    function syncYouTubeMetadata() {
        const track = getCurrentTrack();
        const player = state.youtubePlayer;
        if (!track || track.source !== 'youtube' || !player || !state.youtubeReady) return;
        let data;
        try { data = player.getVideoData(); } catch { return; }
        if (!data || (data.video_id && data.video_id !== track.youtubeId)) return;

        let changed = false;
        if (data.title && data.title !== track.title) {
            track.title = data.title;
            changed = true;
        }
        const author = data.author || 'YouTube';
        if (author && author !== track.artist) {
            track.artist = author;
            changed = true;
        }
        if (!changed) return;
        updatePlayerInfo();
        updateMediaSession();
        renderLibrary();
        renderQueue();
    }

    function updateYouTubeProgress() {
        const track = getCurrentTrack();
        if (!track || track.source !== 'youtube') return;
        const duration = media.duration;
        if (Number.isFinite(duration) && duration > 0) {
            setProgressUI((media.currentTime / duration) * 100);
        }
        updateTimeUI();
        drawWaveform();
        updateSessionPosition();
    }

    function startYouTubeTimer() {
        if (state.youtubeTimer) return;
        updateYouTubeProgress();
        state.youtubeTimer = window.setInterval(() => {
            const playerState = getYouTubeState();
            if (playerState === 1 || playerState === 3) updateYouTubeProgress();
            else if (playerState === 0) stopYouTubeTimer();
        }, 500);
    }

    function stopYouTubeTimer() {
        if (state.youtubeTimer) {
            window.clearInterval(state.youtubeTimer);
            state.youtubeTimer = null;
        }
    }

    function addFiles(fileList) {
        const files = Array.from(fileList || []).filter(isMediaFile);
        if (!files.length) {
            toast('No playable audio or video files found', { icon: 'fa-triangle-exclamation', tone: 'warn' });
            return;
        }

        const newTracks = files.map(createTrack);
        state.tracks.push(...newTracks);
        const newIds = newTracks.map(track => track.id);
        if (state.shuffle) shuffleArray(newIds);
        state.queue.push(...newIds);

        newTracks.forEach(probeDuration);

        if (!state.currentId) {
            const firstId = state.queue[0] || newTracks[0].id;
            loadTrack(firstId, true);
        } else {
            renderAll();
        }

        const skipped = Array.from(fileList || []).length - files.length;
        const suffix = files.length === 1 ? '' : 's';
        toast(`${files.length} ${files.length === 1 ? 'track' : 'tracks'} added${skipped > 0 ? ` · ${skipped} skipped` : ''}`, { icon: 'fa-plus' });
    }

    function probeDuration(track) {
        if (track.duration) return;
        const element = document.createElement(track.kind === 'video' ? 'video' : 'audio');
        element.preload = 'metadata';
        const url = URL.createObjectURL(track.file);
        let settled = false;

        const cleanup = () => {
            if (settled) return;
            settled = true;
            URL.revokeObjectURL(url);
            element.removeAttribute('src');
            try { element.load(); } catch { /* noop */ }
            updateDurationLabels(track.id);
            updateLibraryMeta(visibleTracks());
            updateQueueMeta();
        };

        element.addEventListener('loadedmetadata', () => {
            if (Number.isFinite(element.duration) && element.duration > 0) {
                track.duration = element.duration;
            }
            cleanup();
        }, { once: true });
        element.addEventListener('error', cleanup, { once: true });
        element.src = url;
    }

    function updateDurationLabels(trackId) {
        const track = getTrack(trackId);
        if (!track) return;
        $$(`[data-duration-id="${trackId}"]`).forEach(element => {
            element.textContent = formatTime(track.duration);
        });
    }

    // ---------- Library rendering ----------
    function visibleTracks() {
        let list = state.tracks.slice();

        if (state.filter === 'favorites') list = list.filter(track => track.favorite);
        if (state.filter === 'audio') list = list.filter(track => track.kind === 'audio');
        if (state.filter === 'video') list = list.filter(track => track.kind === 'video');
        if (state.filter === 'recent') list = list.filter(track => track.lastPlayed);

        const query = state.search.trim().toLowerCase();
        if (query) {
            list = list.filter(track => `${track.title} ${track.artist} ${track.album} ${track.host || ''} ${track.file ? track.file.name : ''}`.toLowerCase().includes(query));
        }

        if (state.filter === 'recent') {
            list.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        } else if (state.sort === 'recent') {
            list.sort((a, b) => b.addedAt - a.addedAt);
        } else if (state.sort === 'title') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (state.sort === 'artist') {
            list.sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
        } else if (state.sort === 'duration') {
            list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        }

        return list;
    }

    function renderLibrary() {
        const scrollTop = libraryScroll.scrollTop;
        const list = visibleTracks();
        const current = getCurrentTrack();

        libraryList.className = `library-list${state.view === 'grid' ? ' grid-view' : ''}`;
        libraryScroll.classList.toggle('grid-mode', state.view === 'grid');
        viewButtons.forEach(button => {
            const active = button.dataset.view === state.view;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        if (!state.tracks.length) {
            libraryList.innerHTML = `
                <div class="library-empty">
                    <span class="empty-orbit"><i class="fa-solid fa-photo-film" aria-hidden="true"></i></span>
                    <h3>Nothing here yet</h3>
                    <p>Drop files anywhere, choose “Files”, or link a direct media URL.</p>
                </div>`;
            updateLibraryMeta(list);
            libraryScroll.scrollTop = scrollTop;
            return;
        }

        if (!list.length) {
            libraryList.innerHTML = `
                <div class="library-no-results">
                    <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                    <p>No matches. Try another search or filter.</p>
                </div>`;
            updateLibraryMeta(list);
            libraryScroll.scrollTop = scrollTop;
            return;
        }

        if (state.view === 'grid') {
            libraryList.innerHTML = list.map((track, index) => {
                const active = current && current.id === track.id;
                return `
                    <div class="track-card${active ? ' active' : ''}" data-track-id="${track.id}" tabindex="0" role="button" aria-label="Play ${escapeHTML(track.title)}" style="${coverStyle(track)}">
                        <div class="card-art">
                            ${escapeHTML(initialsFor(track))}
                            <button class="row-fav${track.favorite ? ' active' : ''}" data-fav-id="${track.id}" title="Favorite" aria-label="Favorite ${escapeHTML(track.title)}"><i class="${track.favorite ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i></button>
                            <span class="card-play"><i class="fa-solid ${active && state.isPlaying ? 'fa-pause' : 'fa-play'}" aria-hidden="true"></i></span>
                        </div>
                        <div class="card-title">${escapeHTML(track.title)}</div>
                        <div class="card-sub">${escapeHTML(track.artist)}</div>
                    </div>`;
            }).join('');
        } else {
            libraryList.innerHTML = list.map((track, index) => {
                const active = current && current.id === track.id;
                return `
                    <div class="track-row${active ? ' active' : ''}" data-track-id="${track.id}" tabindex="0" role="button" aria-label="Play ${escapeHTML(track.title)}">
                        <span class="row-index">${active ? '<span class="playing-bars" aria-hidden="true"><span></span><span></span><span></span></span>' : String(index + 1).padStart(2, '0')}</span>
                        <span class="row-art" style="${coverStyle(track)}">${escapeHTML(initialsFor(track))}</span>
                        <span class="row-main">
                            <span class="row-title">${escapeHTML(track.title)}</span>
                            <span class="row-sub">${escapeHTML(track.artist)} · ${escapeHTML(track.remote ? (track.host || 'Remote') : track.ext)}</span>
                        </span>
                        <span class="row-album">${escapeHTML(track.album)}</span>
                        <span class="row-duration" data-duration-id="${track.id}">${formatTime(track.duration)}</span>
                        <button class="row-fav${track.favorite ? ' active' : ''}" data-fav-id="${track.id}" title="Favorite" aria-label="Favorite ${escapeHTML(track.title)}"><i class="${track.favorite ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i></button>
                    </div>`;
            }).join('');
        }

        updateLibraryMeta(list);
        libraryScroll.scrollTop = scrollTop;
    }

    function updateLibraryMeta(list) {
        const counts = {
            all: state.tracks.length,
            favorites: state.tracks.filter(track => track.favorite).length,
            audio: state.tracks.filter(track => track.kind === 'audio').length,
            video: state.tracks.filter(track => track.kind === 'video').length,
            recent: state.tracks.filter(track => track.lastPlayed).length
        };

        filterButtons.forEach(button => {
            button.title = `${counts[button.dataset.filter] || 0} item${counts[button.dataset.filter] === 1 ? '' : 's'}`;
        });

        if (!state.tracks.length) {
            libraryMeta.textContent = 'No media yet — add a few files to begin.';
            return;
        }

        const filterLabel = state.filter === 'all' ? '' : state.filter + ' · ';
        const shown = list ? list.length : counts[state.filter];
        const totalDuration = state.tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
        const totalSize = state.tracks.reduce((sum, track) => sum + (track.file ? track.file.size : 0), 0);
        const remoteCount = state.tracks.filter(track => track.remote).length;
        const durationPart = totalDuration > 0 ? `${formatTime(totalDuration)} · ` : '';
        const scope = state.filter === 'all' && !state.search
            ? `${counts.all} track${counts.all === 1 ? '' : 's'}`
            : `${filterLabel}${shown} shown`;
        const linkedPart = remoteCount ? ` · ${remoteCount} linked` : '';
        const sizePart = totalSize > 0 ? formatBytes(totalSize) : '';
        libraryMeta.textContent = `${scope} · ${durationPart}${sizePart}${linkedPart}`;
    }

    // ---------- Queue rendering ----------
    function renderQueue(scrollToCurrent = false) {
        queueCount.textContent = String(state.queue.length);

        if (!state.queue.length) {
            queueList.innerHTML = `
                <div class="empty-state compact">
                    <i class="fa-solid fa-list-ul" aria-hidden="true"></i>
                    <p>Your queue is empty.</p>
                </div>`;
        } else {
            queueList.innerHTML = state.queue.map(id => {
                const track = getTrack(id);
                if (!track) return '';
                const active = id === state.currentId;
                return `
                    <div class="queue-item${active ? ' active' : ''}" data-queue-id="${track.id}" draggable="true">
                        <span class="drag-handle" aria-hidden="true"><i class="fa-solid fa-grip-lines"></i></span>
                        <span class="queue-art" style="${coverStyle(track)}">${escapeHTML(initialsFor(track))}</span>
                        <span class="queue-info">
                            <strong>${escapeHTML(track.title)}</strong>
                            <span>${escapeHTML(track.artist)}</span>
                        </span>
                        <span class="queue-duration" data-duration-id="${track.id}">${formatTime(track.duration)}</span>
                        <button class="queue-remove" data-remove-id="${track.id}" title="Remove from queue" aria-label="Remove ${escapeHTML(track.title)} from queue">
                            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                        </button>
                    </div>`;
            }).join('');
        }

        updateQueueMeta();
        bindQueueDnD();

        if (scrollToCurrent) {
            const active = $('.queue-item.active', queueList);
            if (active) active.scrollIntoView({ block: 'nearest' });
        }
    }

    function updateQueueMeta() {
        const total = state.queue.reduce((sum, id) => {
            const track = getTrack(id);
            return sum + (track && track.duration ? track.duration : 0);
        }, 0);
        queueDuration.textContent = formatTime(total);
        queueNote.textContent = state.shuffle ? 'Shuffled' : (state.repeat === 'off' ? 'Play queue' : REPEAT_LABELS[state.repeat]);
        updateNextUp();
    }

    function bindQueueDnD() {
        $$('.queue-item', queueList).forEach(item => {
            item.addEventListener('dragstart', event => {
                state.dragQueueId = item.dataset.queueId;
                item.classList.add('dragging');
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', item.dataset.queueId);
                }
            });
            item.addEventListener('dragend', () => {
                state.dragQueueId = null;
                item.classList.remove('dragging');
                $$('.queue-item', queueList).forEach(row => row.classList.remove('drop-target'));
            });
            item.addEventListener('dragover', event => {
                if (!state.dragQueueId || state.dragQueueId === item.dataset.queueId) return;
                event.preventDefault();
                if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
                item.classList.add('drop-target');
            });
            item.addEventListener('dragleave', () => item.classList.remove('drop-target'));
            item.addEventListener('drop', event => {
                if (!state.dragQueueId) return;
                event.preventDefault();
                event.stopPropagation();
                const targetId = item.dataset.queueId;
                item.classList.remove('drop-target');
                reorderQueue(state.dragQueueId, targetId);
                state.dragQueueId = null;
            });
        });
    }

    function reorderQueue(dragId, targetId) {
        if (!dragId || dragId === targetId) return;
        const from = state.queue.indexOf(dragId);
        if (from === -1) return;
        state.queue.splice(from, 1);
        let to = state.queue.indexOf(targetId);
        if (to === -1) to = state.queue.length;
        state.queue.splice(to, 0, dragId);
        renderQueue();
        updateNextUp();
    }

    function removeFromQueue(id) {
        const position = state.queue.indexOf(id);
        if (position === -1) return;
        const wasCurrent = id === state.currentId;
        state.queue = state.queue.filter(item => item !== id);

        if (wasCurrent) {
            if (state.queue.length) {
                const nextId = state.queue[Math.min(position, state.queue.length - 1)];
                loadTrack(nextId, true);
            } else {
                stopPlayback();
            }
        }

        renderQueue();
        updateNextUp();
        updateQueueMeta();
    }

    function ensureInQueue(id) {
        if (!state.queue.includes(id)) {
            const currentIndex = state.queue.indexOf(state.currentId);
            if (currentIndex >= 0) state.queue.splice(currentIndex + 1, 0, id);
            else state.queue.push(id);
        }
    }

    // ---------- Playback ----------
    function loadTrack(id, autoplay = true) {
        const track = getTrack(id);
        if (!track) return;

        ensureInQueue(id);

        const isYouTube = track.source === 'youtube';
        const target = isYouTube ? youtubeMedia : (track.kind === 'video' ? videoPlayer : (track.remote ? streamAudio : localAudio));
        const alreadyLoaded = isYouTube
            ? media === target && state.youtubeActiveId === id && youtubeFallback.hidden
            : media === target && Boolean(media.src);

        if (state.currentId === id && alreadyLoaded) {
            if (autoplay && media.paused) playMedia();
            return;
        }

        if (document.fullscreenElement === videoPlayer && (track.kind !== 'video' || isYouTube)) {
            document.exitFullscreen().catch(() => {});
        }

        state.currentId = id;
        track.lastPlayed = Date.now();

        if (media !== target) {
            media.pause();
            media = target;
        }

        const oldUrl = state.currentObjectURL;

        if (isYouTube) {
            state.currentObjectURL = null;
            mediaElements.forEach(element => {
                element.pause();
                element.removeAttribute('src');
                try { element.load(); } catch { /* noop */ }
            });
            loadYouTubeTrack(track);
        } else {
            stopYouTube();
            state.currentObjectURL = track.remote ? null : URL.createObjectURL(track.file);
            mediaElements.forEach(element => {
                if (element === media) return;
                element.pause();
                element.removeAttribute('src');
                try { element.load(); } catch { /* noop */ }
            });
            media.src = track.remote ? track.url : state.currentObjectURL;
            media.load();
        }
        if (oldUrl) window.setTimeout(() => URL.revokeObjectURL(oldUrl), 1500);

        state.progress = 0;
        setProgressUI(0);
        currentTimeEl.textContent = '00:00';
        durationTimeEl.textContent = formatTime(track.duration);
        setStatus('Loading', 'loading');

        applyMediaView(track);
        renderLibrary();
        renderQueue(true);
        updatePlayerInfo();
        updateNextUp();
        updateMediaSession();

        media.defaultPlaybackRate = state.speed;
        media.playbackRate = state.speed;

        if (track.kind === 'audio' && !track.remote) generatePeaks(track);

        if (autoplay) playMedia();
        else updatePlayIcon(false);
    }

    function applyMediaView(track) {
        videoPlayer.controls = document.fullscreenElement === videoPlayer;

        if (!track) {
            videoPlayer.style.display = 'none';
            canvas.style.display = 'none';
            remoteStage.hidden = true;
            youtubeStage.hidden = true;
            youtubeFallback.hidden = true;
            placeholder.style.display = 'flex';
            visualizerBtn.hidden = true;
            visualizerHint.style.visibility = 'hidden';
            pipBtn.hidden = true;
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
            stopVisualizer();
            return;
        }

        placeholder.style.display = 'none';
        favoriteBtn.disabled = false;

        if (track.source === 'youtube') {
            videoPlayer.style.display = 'none';
            canvas.style.display = 'none';
            remoteStage.hidden = true;
            youtubeStage.hidden = false;
            visualizerBtn.hidden = true;
            visualizerHint.style.visibility = 'visible';
            pipBtn.hidden = true;
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
            stopVisualizer();
            return;
        }

        youtubeStage.hidden = true;
        youtubeFallback.hidden = true;

        if (track.kind === 'video') {
            videoPlayer.style.display = 'block';
            canvas.style.display = 'none';
            remoteStage.hidden = true;
            visualizerBtn.hidden = true;
            visualizerHint.style.visibility = 'hidden';
            pipBtn.hidden = !document.pictureInPictureEnabled;
            stopVisualizer();
            return;
        }

        videoPlayer.style.display = 'none';
        pipBtn.hidden = true;
        visualizerHint.style.visibility = 'visible';

        if (track.remote) {
            canvas.style.display = 'none';
            remoteStage.hidden = false;
            remoteStage.style.setProperty('--cover-h1', track.hue1);
            remoteStage.style.setProperty('--cover-h2', track.hue2);
            remoteInitials.textContent = initialsFor(track);
            remoteTitle.textContent = track.title;
            remoteHost.textContent = track.host || 'Remote stream';
            visualizerBtn.hidden = true;
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
            stopVisualizer();
        } else {
            remoteStage.hidden = true;
            canvas.style.display = 'block';
            visualizerBtn.hidden = false;
            if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
            resizeVisualizerCanvas();
            drawWaveform();
        }
    }

    function playMedia() {
        const track = getCurrentTrack();
        if (!track) {
            if (state.queue.length) loadTrack(state.queue[0], true);
            else fileInput.click();
            return;
        }

        if (track.kind === 'audio' && !track.remote) initAudioContext();
        if (track.kind === 'audio' && !track.remote && state.audioCtx && state.audioCtx.state === 'suspended') state.audioCtx.resume();
        if (media.ended) media.currentTime = 0;
        media.play().catch(error => {
            console.warn('Playback was blocked:', error);
            setStatus('Ready', 'stopped');
            updatePlayIcon(false);
        });
    }

    function togglePlay() {
        if (!state.currentId) {
            if (state.queue.length) loadTrack(state.queue[0], true);
            else fileInput.click();
            return;
        }
        if (media.paused) playMedia();
        else media.pause();
    }

    function playNext(manual = true) {
        if (!state.queue.length) {
            if (manual) toast('The queue is empty', { icon: 'fa-list-ul', tone: 'warn' });
            return;
        }

        if (!manual && state.repeat === 'one') {
            media.currentTime = 0;
            playMedia();
            return;
        }

        const position = state.queue.indexOf(state.currentId);
        let nextPosition = position + 1;
        if (position === -1) nextPosition = 0;

        if (nextPosition >= state.queue.length) {
            if (state.repeat === 'all' || manual) nextPosition = 0;
            else {
                setStatus('Ended', 'stopped');
                updatePlayIcon(false);
                return;
            }
        }

        loadTrack(state.queue[nextPosition], true);
    }

    function playPrevious() {
        if (!state.queue.length) {
            if (state.currentId) media.currentTime = 0;
            return;
        }

        if (media.currentTime > 3) {
            media.currentTime = 0;
            return;
        }

        const position = state.queue.indexOf(state.currentId);
        let previousPosition = position - 1;
        if (position === -1) previousPosition = state.queue.length - 1;
        if (previousPosition < 0) previousPosition = state.queue.length - 1;
        loadTrack(state.queue[previousPosition], true);
    }

    function stopPlayback() {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        stopYouTube();
        mediaElements.forEach(element => {
            element.pause();
            element.removeAttribute('src');
            try { element.load(); } catch { /* noop */ }
        });
        media = videoPlayer;
        videoPlayer.controls = false;
        stopVisualizer();
        if (state.currentObjectURL) {
            URL.revokeObjectURL(state.currentObjectURL);
            state.currentObjectURL = null;
        }
        state.currentId = null;
        state.isPlaying = false;
        state.progress = 0;
        state.queue = [];
        setProgressUI(0);
        currentTimeEl.textContent = '00:00';
        durationTimeEl.textContent = '--:--';
        setStatus('Stopped', 'stopped');
        updatePlayIcon(false);
        applyMediaView(null);
        resetPlayerInfo();
        renderLibrary();
        renderQueue();
        updateNextUp();
        updateMediaSession();
    }

    function resetPlayerInfo() {
        infoTitle.textContent = 'No media loaded';
        infoArtist.textContent = 'Your local library, beautifully played';
        infoType.textContent = 'Ready to play';
        coverArt.style.setProperty('--cover-h1', 190);
        coverArt.style.setProperty('--cover-h2', 260);
        coverInitials.textContent = 'MM';
        favoriteBtn.classList.remove('active');
        favoriteBtn.disabled = true;
        favoriteBtn.innerHTML = '<i class="fa-regular fa-heart" aria-hidden="true"></i>';
        mediaBadge.innerHTML = '<i class="fa-solid fa-circle" aria-hidden="true"></i> <span>Ready</span>';
    }

    function updatePlayerInfo() {
        const track = getCurrentTrack();
        if (!track) {
            resetPlayerInfo();
            return;
        }

        infoTitle.textContent = track.title;
        infoArtist.textContent = `${track.artist} · ${track.album}`;
        infoType.textContent = `${track.kind === 'video' ? 'Video' : 'Audio'} · ${track.ext}`;
        coverArt.style.setProperty('--cover-h1', track.hue1);
        coverArt.style.setProperty('--cover-h2', track.hue2);
        coverInitials.textContent = initialsFor(track);
        favoriteBtn.disabled = false;
        favoriteBtn.classList.toggle('active', track.favorite);
        favoriteBtn.innerHTML = `<i class="${track.favorite ? 'fa-solid' : 'fa-regular'} fa-heart" aria-hidden="true"></i>`;
        durationTimeEl.textContent = formatTime(track.duration);
        mediaBadge.innerHTML = `<i class="fa-solid ${track.kind === 'video' ? 'fa-video' : 'fa-music'}" aria-hidden="true"></i> <span>${track.kind === 'video' ? 'Video' : 'Audio'}</span>`;
        updateAmbient(track);
        updateVisualizerUI();
        drawWaveform();
    }

    function updateAmbient(track) {
        if (!ambientGlow) return;
        ambientGlow.style.background = `hsl(${track.hue1} 90% 55%)`;
        ambientGlow.style.opacity = '0.22';
    }

    function updatePlayIcon(playing) {
        if (playIcon) playIcon.className = `fa-solid ${playing ? 'fa-pause' : 'fa-play'}`;
        playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }

    function setStatus(text, stateName) {
        infoStatus.textContent = text;
        infoStatus.dataset.state = stateName;
    }

    function setProgressUI(percent) {
        const value = clamp(percent, 0, 100);
        state.progress = value / 100;
        progressBar.value = value;
        progressBar.style.setProperty('--progress', `${value}%`);
    }

    function updateTimeUI() {
        const duration = media.duration;
        currentTimeEl.textContent = formatTime(media.currentTime);
        durationTimeEl.textContent = Number.isFinite(duration) ? formatTime(duration) : '--:--';
    }

    // ---------- Favorite ----------
    function toggleFavorite(id) {
        const track = getTrack(id);
        if (!track) return;
        track.favorite = !track.favorite;
        const key = favoriteKey(track);
        if (track.favorite) favorites.add(key);
        else favorites.delete(key);
        saveFavorites();

        if (state.currentId === id) updatePlayerInfo();
        renderLibrary();
        toast(track.favorite ? 'Added to favorites' : 'Removed from favorites', {
            icon: track.favorite ? 'fa-heart' : 'fa-heart-crack',
            tone: track.favorite ? 'info' : 'warn'
        });
    }

    // ---------- Shuffle & repeat ----------
    function toggleShuffle() {
        state.shuffle = !state.shuffle;
        if (state.shuffle) {
            const rest = state.queue.filter(id => id !== state.currentId);
            shuffleArray(rest);
            state.queue = state.currentId ? [state.currentId, ...rest] : rest;
        } else {
            state.queue = state.queue.slice().sort((a, b) => {
                const trackA = getTrack(a);
                const trackB = getTrack(b);
                return (trackA ? trackA.addedAt : 0) - (trackB ? trackB.addedAt : 0);
            });
        }
        updateShuffleUI();
        updateRepeatUI();
        renderQueue();
        updateQueueMeta();
        saveSettings();
        toast(state.shuffle ? 'Shuffle on' : 'Shuffle off', { icon: 'fa-shuffle' });
    }

    function cycleRepeat() {
        const order = ['off', 'all', 'one'];
        state.repeat = order[(order.indexOf(state.repeat) + 1) % order.length];
        updateRepeatUI();
        updateQueueMeta();
        saveSettings();
        toast(REPEAT_LABELS[state.repeat], { icon: 'fa-repeat' });
    }

    function updateShuffleUI() {
        shuffleBtn.classList.toggle('active', state.shuffle);
        shuffleBtn.setAttribute('aria-pressed', state.shuffle ? 'true' : 'false');
    }

    function updateRepeatUI() {
        repeatBtn.classList.toggle('active', state.repeat !== 'off');
        repeatBtn.title = `${REPEAT_LABELS[state.repeat]} (R)`;
        repeatBtn.setAttribute('aria-label', REPEAT_LABELS[state.repeat]);
        repeatBadge.hidden = state.repeat !== 'one';
        repeatBadge.textContent = '1';
    }

    // ---------- EQ ----------
    function applyEqValues(values) {
        eqSliders.forEach((slider, index) => {
            slider.value = values[index];
        });
    }

    function setEqPreset(preset, notify = false) {
        if (preset !== 'custom' && EQ_PRESETS[preset]) {
            applyEqValues(EQ_PRESETS[preset].map(db => 50 + db * (50 / 12)));
        }
        eqPresetSelect.value = preset;
        eqStatus.textContent = EQ_PRESET_LABELS[preset] || 'Custom curve';
        syncEqFilters();
        saveSettings();
        if (notify) toast(`${EQ_PRESET_LABELS[preset]} applied`, { icon: 'fa-sliders' });
    }

    function setCustomEqFromSliders() {
        eqPresetSelect.value = 'custom';
        eqStatus.textContent = EQ_PRESET_LABELS.custom;
        eqSliders.forEach((slider, index) => {
            const gain = (Number(slider.value) - 50) * (12 / 50);
            if (state.eqFilters[index]) state.eqFilters[index].gain.value = gain;
        });
        saveSettings();
    }

    function syncEqFilters() {
        eqSliders.forEach((slider, index) => {
            if (state.eqFilters[index]) {
                state.eqFilters[index].gain.value = (Number(slider.value) - 50) * (12 / 50);
            }
        });
    }

    // ---------- Audio context / visualizer ----------
    function initAudioContext() {
        if (state.audioCtx) {
            if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
            return;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        try {
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            const source = ctx.createMediaElementSource(localAudio);
            const filters = [];

            let previous = source;
            EQ_FREQUENCIES.forEach((frequency, index) => {
                const filter = ctx.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = frequency;
                filter.Q.value = 1;
                filter.gain.value = (Number(eqSliders[index].value) - 50) * (12 / 50);
                previous.connect(filter);
                previous = filter;
                filters.push(filter);
            });

            previous.connect(analyser);
            analyser.connect(ctx.destination);
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.82;

            state.audioCtx = ctx;
            state.analyser = analyser;
            state.eqFilters = filters;

            if (ctx.state === 'suspended') ctx.resume();

            if (!state.resizeBound) {
                window.addEventListener('resize', handleResize);
                state.resizeBound = true;
            }
        } catch (error) {
            console.warn('Web Audio API is unavailable:', error);
        }
    }

    function handleResize() {
        resizeVisualizerCanvas();
        drawWaveform();
    }

    function resizeVisualizerCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(viewport.clientWidth * dpr));
        const height = Math.max(1, Math.floor(viewport.clientHeight * dpr));
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }
    }

    function startVisualizer() {
        if (!state.animationId) drawVisualizer();
    }

    function stopVisualizer() {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
    }

    function drawVisualizer() {
        const track = getCurrentTrack();
        if (!state.analyser || media.paused || !track || track.kind !== 'audio' || track.remote) {
            state.animationId = null;
            return;
        }

        state.animationId = requestAnimationFrame(drawVisualizer);

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = canvas.width / dpr;
        const height = canvas.height / dpr;
        if (width < 1 || height < 1) return;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.fillRect(0, 0, width, height);

        const bufferLength = state.analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLength);

        if (state.visualizer === 0) {
            state.analyser.getByteFrequencyData(data);
            const bars = Math.max(40, Math.floor(width / 12));
            const gap = 3;
            const barWidth = Math.max(1, (width - (bars - 1) * gap) / bars);
            const step = Math.max(1, Math.floor((bufferLength / 2) / bars));
            let x = 0;

            for (let i = 0; i < bars; i++) {
                const value = data[i * step] / 255;
                const barHeight = Math.max(2, value * (height - 20));
                const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
                gradient.addColorStop(0, getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4ce7ff');
                gradient.addColorStop(1, getComputedStyle(document.body).getPropertyValue('--accent-2').trim() || '#6c7cff');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                if (typeof ctx.roundRect === 'function') ctx.roundRect(x, height - barHeight, barWidth, barHeight, [3, 3, 0, 0]);
                else ctx.rect(x, height - barHeight, barWidth, barHeight);
                ctx.fill();
                x += barWidth + gap;
            }
        } else if (state.visualizer === 1) {
            state.analyser.getByteTimeDomainData(data);
            const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4ce7ff';
            ctx.lineWidth = 2.4;
            ctx.strokeStyle = accent;
            ctx.shadowColor = accent;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            const slice = width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const y = (data[i] / 128) * height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += slice;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            state.analyser.getByteFrequencyData(data);
            const centerX = width / 2;
            const centerY = height / 2;
            const baseRadius = Math.min(centerX, centerY) * 0.4;
            const average = data.reduce((sum, value) => sum + value, 0) / bufferLength;
            const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4ce7ff';

            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + average * 0.16, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + (average / 255) * 0.08})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + (average / 255) * 0.3})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            const bars = 72;
            const step = Math.floor(bufferLength / bars);
            for (let i = 0; i < bars; i++) {
                const value = data[i * step] / 255;
                const barHeight = 4 + value * Math.min(centerX, centerY) * 0.42;
                const angle = (Math.PI * 2 / bars) * i - Math.PI / 2;
                const startX = centerX + Math.cos(angle) * baseRadius;
                const startY = centerY + Math.sin(angle) * baseRadius;
                const endX = centerX + Math.cos(angle) * (baseRadius + barHeight);
                const endY = centerY + Math.sin(angle) * (baseRadius + barHeight);
                ctx.strokeStyle = accent;
                ctx.globalAlpha = 0.25 + value * 0.75;
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        }
    }

    function updateVisualizerUI() {
        const track = getCurrentTrack();
        visualizerName.textContent = VISUALIZERS[state.visualizer];
        if (track && track.source === 'youtube') {
            visualizerHintText.textContent = 'YouTube · external player';
        } else if (track && track.remote) {
            visualizerHintText.textContent = 'Direct stream · visualizer for local audio';
        } else {
            visualizerHintText.textContent = `Visualizer · ${VISUALIZERS[state.visualizer]}`;
        }
        visualizerBtn.setAttribute('aria-label', `Visualizer: ${VISUALIZERS[state.visualizer]}`);
    }

    function cycleVisualizer() {
        const track = getCurrentTrack();
        if (!track || track.kind !== 'audio' || track.remote) return;
        state.visualizer = (state.visualizer + 1) % VISUALIZERS.length;
        updateVisualizerUI();
        saveSettings();
        showVisualizerToast(VISUALIZERS[state.visualizer]);
        if (!media.paused) {
            stopVisualizer();
            startVisualizer();
        }
    }

    function showVisualizerToast(text) {
        visToast.textContent = text;
        visToast.classList.add('show');
        window.clearTimeout(showVisualizerToast.timer);
        showVisualizerToast.timer = window.setTimeout(() => visToast.classList.remove('show'), 1600);
    }

    // ---------- Waveform ----------
    function generatePeaks(track) {
        if (!track || track.kind !== 'audio' || track.remote || !track.file || track.peaks || track.file.size > MAX_PEAK_SIZE) return;
        const OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
        if (!OfflineContext) return;

        track.file.arrayBuffer().then(buffer => {
            const ctx = new OfflineContext(1, 44100, 44100);
            return ctx.decodeAudioData(buffer);
        }).then(audioBuffer => {
            const data = audioBuffer.getChannelData(0);
            const barCount = 220;
            const block = Math.max(1, Math.floor(data.length / barCount));
            const stride = Math.max(1, Math.floor(block / 260));
            const peaks = new Float32Array(barCount);
            let maxPeak = 0;

            for (let i = 0; i < barCount; i++) {
                let peak = 0;
                const start = i * block;
                for (let j = 0; j < block; j += stride) {
                    const value = Math.abs(data[start + j] || 0);
                    if (value > peak) peak = value;
                }
                peaks[i] = peak;
                if (peak > maxPeak) maxPeak = peak;
            }

            if (maxPeak > 0) {
                for (let i = 0; i < barCount; i++) peaks[i] = Math.pow(peaks[i] / maxPeak, 0.72);
            }

            track.peaks = Array.from(peaks);
            if (state.currentId === track.id) drawWaveform();
        }).catch(() => {
            /* waveform analysis is optional */
        });
    }

    function resizeWaveformCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(waveformCanvas.clientWidth * dpr));
        const height = Math.max(1, Math.floor(waveformCanvas.clientHeight * dpr));
        if (waveformCanvas.width !== width || waveformCanvas.height !== height) {
            waveformCanvas.width = width;
            waveformCanvas.height = height;
        }
    }

    function roundRect(ctx, x, y, width, height, radius) {
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
            return;
        }
        const r = Math.min(radius, width / 2, height / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + width, y, x + width, y + height, r);
        ctx.arcTo(x + width, y + height, x, y + height, r);
        ctx.arcTo(x, y + height, x, y, r);
        ctx.arcTo(x, y, x + width, y, r);
        ctx.closePath();
    }

    function drawWaveform() {
        const width = waveformCanvas.clientWidth;
        const height = waveformCanvas.clientHeight;
        if (!width || !height) return;

        resizeWaveformCanvas();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const ctx = waveformCanvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const track = getCurrentTrack();
        const progress = clamp(state.progress, 0, 1);
        const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#4ce7ff';
        const accent2 = getComputedStyle(document.body).getPropertyValue('--accent-2').trim() || '#6c7cff';
        const playedGradient = ctx.createLinearGradient(0, 0, width, 0);
        playedGradient.addColorStop(0, accent);
        playedGradient.addColorStop(1, accent2);
        const idle = 'rgba(255, 255, 255, 0.16)';

        if (track && track.peaks && track.peaks.length) {
            const bars = Math.max(36, Math.floor(width / 4));
            const gap = 2;
            const barWidth = Math.max(1, (width - (bars - 1) * gap) / bars);
            const peaks = track.peaks;
            let x = 0;
            for (let i = 0; i < bars; i++) {
                const peak = peaks[Math.floor((i / bars) * peaks.length)] || 0;
                const barHeight = Math.max(2, peak * (height - 12));
                const y = height - barHeight - 3;
                ctx.fillStyle = (x + barWidth / 2) / width <= progress ? playedGradient : idle;
                roundRect(ctx, x, y, barWidth, barHeight, Math.min(2, barWidth / 2));
                ctx.fill();
                x += barWidth + gap;
            }
        } else {
            const mid = height / 2;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
            roundRect(ctx, 0, mid - 2, width, 4, 2);
            ctx.fill();
            if (progress > 0) {
                ctx.fillStyle = playedGradient;
                roundRect(ctx, 0, mid - 2, width * progress, 4, 2);
                ctx.fill();
            }
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            for (let x = 0; x < width; x += 24) {
                ctx.fillRect(x, mid - 7, 1, 14);
            }
        }

        if (progress > 0 && progress < 1) {
            const x = width * progress;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
            ctx.fillRect(x - 0.5, 4, 1.5, height - 8);
        }
    }

    // ---------- Media Session ----------
    function initMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const handlers = {
            play: () => playMedia(),
            pause: () => { if (state.currentId) media.pause(); },
            stop: () => {
                media.pause();
                if (Number.isFinite(media.duration)) media.currentTime = 0;
            },
            previoustrack: () => playPrevious(),
            nexttrack: () => playNext(true),
            seekbackward: details => { media.currentTime = Math.max(0, media.currentTime - (details.seekOffset || 10)); },
            seekforward: details => { media.currentTime = Math.min(media.duration || 0, media.currentTime + (details.seekOffset || 10)); },
            seekto: details => { if (Number.isFinite(details.seekTime)) media.currentTime = details.seekTime; }
        };
        Object.entries(handlers).forEach(([action, handler]) => {
            try { navigator.mediaSession.setActionHandler(action, handler); } catch { /* unsupported action */ }
        });
    }

    function updateMediaSession() {
        if (!('mediaSession' in navigator)) return;
        const track = getCurrentTrack();
        if (!track) {
            navigator.mediaSession.metadata = null;
            return;
        }
        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
            });
        } catch {
            /* ignore */
        }
    }

    function updateSessionState() {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = media.paused ? 'paused' : 'playing';
    }

    function updateSessionPosition() {
        if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
        if (!Number.isFinite(media.duration) || media.duration <= 0) return;
        try {
            navigator.mediaSession.setPositionState({
                duration: media.duration,
                playbackRate: media.playbackRate,
                position: Math.min(media.currentTime, media.duration)
            });
        } catch {
            /* ignore */
        }
    }

    // ---------- Volume / speed / sleep ----------
    function updateVolumeUI() {
        const volume = state.muted ? 0 : state.volume;
        volumeSlider.value = Math.round(volume * 100);
        volumeSlider.style.setProperty('--vol', `${volume * 100}%`);
        volumeIcon.className = state.muted || state.volume === 0
            ? 'fa-solid fa-volume-xmark'
            : (state.volume < 0.45 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high');
    }

    function applyVolumeState() {
        mediaElements.forEach(element => {
            element.volume = state.volume;
            element.muted = state.muted;
        });
        syncYouTubeVolume();
    }

    function setVolume(value) {
        state.volume = clamp(value, 0, 1);
        if (state.volume > 0) state.muted = false;
        applyVolumeState();
        updateVolumeUI();
        saveSettings();
    }

    function toggleMute() {
        state.muted = !state.muted;
        applyVolumeState();
        updateVolumeUI();
        saveSettings();
        toast(state.muted ? 'Muted' : 'Unmuted', { icon: state.muted ? 'fa-volume-xmark' : 'fa-volume-high' });
    }

    function setSpeed(value) {
        const speed = clamp(Number(value) || 1, 0.25, 4);
        state.speed = speed;
        mediaElements.forEach(element => {
            element.defaultPlaybackRate = speed;
            element.playbackRate = speed;
        });
        syncYouTubeSpeed();
        speedLabel.textContent = `${speed.toFixed(speed % 1 === 0 ? 1 : 2)}×`;
        $$('#speed-popover .popover-item').forEach(item => {
            item.classList.toggle('active', Number(item.dataset.speed) === speed);
        });
        saveSettings();
    }

    function startSleep(minutes) {
        stopSleep(false);
        if (!minutes) {
            toast('Sleep timer off', { icon: 'fa-moon' });
            return;
        }
        state.sleepEnd = Date.now() + minutes * 60000;
        sleepChip.hidden = false;
        sleepBtn.classList.add('active');
        updateSleepChip();
        state.sleepInterval = window.setInterval(updateSleepChip, 1000);
        toast(`Sleep timer set for ${minutes} minutes`, { icon: 'fa-moon' });
    }

    function stopSleep(notify = true) {
        if (state.sleepInterval) window.clearInterval(state.sleepInterval);
        state.sleepInterval = null;
        state.sleepEnd = null;
        sleepChip.hidden = true;
        sleepBtn.classList.remove('active');
        if (notify) toast('Sleep timer off', { icon: 'fa-moon' });
    }

    function updateSleepChip() {
        if (!state.sleepEnd) return;
        const remaining = Math.max(0, state.sleepEnd - Date.now());
        const totalSeconds = Math.ceil(remaining / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        sleepChip.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
        if (remaining <= 0) {
            media.pause();
            stopSleep(false);
            toast('Sleep timer finished — playback paused', { icon: 'fa-moon' });
        }
    }

    // ---------- Accent ----------
    function setAccent(accent, notify = false) {
        if (!ACCENTS.includes(accent)) return;
        document.body.dataset.accent = accent;
        $$('.swatch').forEach(swatch => swatch.classList.toggle('active', swatch.dataset.accent === accent));
        saveSettings();
        drawWaveform();
        const track = getCurrentTrack();
        if (track) updateAmbient(track);
        if (notify) toast(`Accent: ${accent}`, { icon: 'fa-palette' });
    }

    // ---------- Popovers & modals ----------
    function closePopovers() {
        $$('.popover-anchor.open').forEach(anchor => anchor.classList.remove('open'));
    }

    function togglePopover(button) {
        const anchor = button.closest('.popover-anchor');
        if (!anchor) return;
        const wasOpen = anchor.classList.contains('open');
        closePopovers();
        if (!wasOpen) anchor.classList.add('open');
    }

    let previousFocus = null;

    function openModal(modal, focusTarget) {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        closePopovers();
        previousFocus = document.activeElement;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        if (focusTarget) window.setTimeout(() => focusTarget.focus(), 30);
    }

    function closeModal(modal) {
        modal.hidden = true;
        if (modal === urlModal) {
            urlError.textContent = '';
            urlInput.value = '';
        }
        if (!$('.modal:not([hidden])')) {
            document.body.classList.remove('modal-open');
            if (previousFocus && previousFocus.isConnected) previousFocus.focus();
            previousFocus = null;
        }
    }


    function buildCommands() {
        const track = getCurrentTrack();
        const commands = [
            { icon: state.isPlaying ? 'fa-pause' : 'fa-play', label: state.isPlaying ? 'Pause playback' : 'Play', hint: 'Space', run: togglePlay },
            { icon: 'fa-forward-step', label: 'Next track', hint: 'N', run: () => playNext(true) },
            { icon: 'fa-backward-step', label: 'Previous track', hint: 'P', run: playPrevious },
            { icon: 'fa-shuffle', label: `Shuffle: ${state.shuffle ? 'on' : 'off'}`, hint: 'S', run: toggleShuffle },
            { icon: 'fa-repeat', label: `Repeat: ${state.repeat}`, hint: 'R', run: cycleRepeat },
            { icon: 'fa-wave-square', label: `Visualizer: ${VISUALIZERS[state.visualizer]}`, hint: 'V', run: cycleVisualizer },
            { icon: 'fa-heart', label: track && track.favorite ? 'Remove from favorites' : 'Add to favorites', hint: 'F', disabled: !track, run: () => track && toggleFavorite(track.id) },
            { icon: 'fa-folder-open', label: 'Add media files', hint: '', run: () => fileInput.click() },
            { icon: 'fa-folder-tree', label: 'Add a folder', hint: '', run: () => folderInput.click() },
            { icon: 'fa-link', label: 'Add media from a URL', hint: '', run: openUrlModal },
            { icon: 'fa-trash-can', label: 'Clear the queue', disabled: !state.queue.length, run: () => { if (state.queue.length) { stopPlayback(); toast('Queue cleared', { icon: 'fa-trash-can' }); } } },
            { icon: 'fa-moon', label: 'Sleep timer · 30 minutes', run: () => startSleep(30) },
            { icon: 'fa-palette', label: 'Cycle accent color', run: () => setAccent(ACCENTS[(ACCENTS.indexOf(document.body.dataset.accent) + 1) % ACCENTS.length], true) },
            { icon: 'fa-expand', label: document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen', run: toggleFullscreen },
            { icon: 'fa-keyboard', label: 'Keyboard shortcuts', hint: '?', run: () => openModal(shortcutsModal, $('.icon-btn[data-close]', shortcutsModal)) },
            { icon: 'fa-magnifying-glass', label: 'Search your library', hint: '/', run: () => globalSearch.focus() }
        ];
        return commands;
    }

    function openCommandPalette() {
        state.commands = buildCommands();
        commandInput.value = '';
        state.commandIndex = 0;
        renderCommandResults('');
        openModal(commandModal, commandInput);
    }

    function renderCommandResults(query) {
        const needle = query.trim().toLowerCase();
        const filtered = state.commands.filter(command => command.label.toLowerCase().includes(needle));
        state.commandIndex = clamp(state.commandIndex, 0, Math.max(0, filtered.length - 1));
        state.filteredCommands = filtered;

        if (!filtered.length) {
            commandResults.innerHTML = '<div class="command-empty">No matching commands</div>';
            return;
        }

        commandResults.innerHTML = filtered.map((command, index) => `
            <button class="command-item${index === state.commandIndex ? ' selected' : ''}" data-command-index="${index}" role="option" ${command.disabled ? 'disabled' : ''}>
                <i class="fa-solid ${command.icon}" aria-hidden="true"></i>
                <span class="command-label">${escapeHTML(command.label)}</span>
                ${command.hint ? `<span class="command-hint">${escapeHTML(command.hint)}</span>` : ''}
            </button>`).join('');
    }

    function runCommand(index) {
        const command = (state.filteredCommands || [])[index];
        if (!command || command.disabled) return;
        closeModal(commandModal);
        command.run();
    }

    function moveCommandSelection(delta) {
        const count = (state.filteredCommands || []).length;
        if (!count) return;
        state.commandIndex = (state.commandIndex + delta + count) % count;
        $$('.command-item', commandResults).forEach((item, index) => item.classList.toggle('selected', index === state.commandIndex));
        const selected = $('.command-item.selected', commandResults);
        if (selected) selected.scrollIntoView({ block: 'nearest' });
    }

    function openShortcuts() {
        openModal(shortcutsModal, $('.icon-btn[data-close]', shortcutsModal));
    }

    function openUrlModal() {
        urlError.textContent = '';
        openModal(urlModal, urlInput);
    }

    // ---------- Fullscreen / PiP ----------
    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                return;
            }
            const track = getCurrentTrack();
            if (track && track.kind === 'video' && track.source !== 'youtube') {
                videoPlayer.controls = true;
                await videoPlayer.requestFullscreen();
            } else {
                await playerPanel.requestFullscreen();
            }
        } catch {
            videoPlayer.controls = false;
            toast('Fullscreen is not available', { icon: 'fa-expand', tone: 'warn' });
        }
    }

    async function togglePip() {
        const track = getCurrentTrack();
        if (!track || track.kind !== 'video' || track.source === 'youtube' || !document.pictureInPictureEnabled) return;
        try {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            else await videoPlayer.requestPictureInPicture();
        } catch {
            toast('Picture in picture is not available', { icon: 'fa-clone', tone: 'warn' });
        }
    }

    // ---------- Next up ----------
    function updateNextUp() {
        const position = state.queue.indexOf(state.currentId);
        let nextId = null;

        if (state.repeat === 'one' && state.currentId) {
            nextId = state.currentId;
        } else if (position >= 0) {
            nextId = state.queue[position + 1] || null;
            if (!nextId && state.repeat === 'all' && state.queue.length) nextId = state.queue[0];
        } else if (state.queue.length) {
            nextId = state.queue[0];
        }

        if (!nextId) {
            nextUpChip.hidden = true;
            return;
        }

        const nextTrack = getTrack(nextId);
        if (!nextTrack) {
            nextUpChip.hidden = true;
            return;
        }

        nextUpChip.hidden = false;
        nextUpTitle.textContent = state.repeat === 'one' && nextId === state.currentId
            ? 'Repeating this track'
            : nextTrack.title;
    }

    // ---------- Player events ----------
    mediaElements.forEach(element => {
        element.addEventListener('play', () => {
            if (element !== media) {
                element.pause();
                return;
            }
            if (!state.currentId) {
                element.pause();
                return;
            }
            state.isPlaying = true;
            updatePlayIcon(true);
            setStatus('Playing', 'playing');
            updateSessionState();
            const track = getCurrentTrack();
            if (track && track.kind === 'audio') {
                if (!track.remote) {
                    initAudioContext();
                    if (state.audioCtx && state.audioCtx.state === 'suspended') state.audioCtx.resume();
                }
                applyMediaView(track);
                if (!track.remote) startVisualizer();
            }
            renderLibrary();
        });

        element.addEventListener('pause', () => {
            if (element !== media) return;
            state.isPlaying = false;
            updatePlayIcon(false);
            stopVisualizer();
            if (state.currentId && element.currentSrc) setStatus('Paused', 'paused');
            else setStatus('Stopped', 'stopped');
            updateSessionState();
            renderLibrary();
        });

        element.addEventListener('playing', () => {
            if (element !== media || !state.currentId) return;
            setStatus('Playing', 'playing');
            updateSessionState();
        });

        element.addEventListener('ended', () => {
            if (element !== media) return;
            playNext(false);
            renderLibrary();
        });

        element.addEventListener('loadedmetadata', () => {
            if (element !== media) return;
            const track = getCurrentTrack();
            if (track && Number.isFinite(element.duration)) {
                track.duration = element.duration;
                updateDurationLabels(track.id);
                updateLibraryMeta(visibleTracks());
                updateQueueMeta();
                updatePlayerInfo();
            }
            updateTimeUI();
            element.playbackRate = state.speed;
            updateSessionPosition();
        });

        element.addEventListener('timeupdate', () => {
            if (element !== media) return;
            const duration = element.duration;
            if (!Number.isFinite(duration) || duration <= 0) return;
            const percent = (element.currentTime / duration) * 100;
            setProgressUI(percent);
            updateTimeUI();
            drawWaveform();
            updateSessionPosition();
        });

        element.addEventListener('error', () => {
            if (element !== media || !state.currentId || !element.currentSrc) return;
            const track = getCurrentTrack();
            setStatus('Error', 'error');
            updatePlayIcon(false);
            toast(track && track.remote ? 'That stream could not be played' : 'This file could not be played', {
                icon: 'fa-triangle-exclamation',
                tone: 'danger'
            });
        });

        element.addEventListener('volumechange', updateVolumeUI);
    });

    // ---------- UI event bindings ----------
    loadMediaBtn.addEventListener('click', event => {
        event.stopPropagation();
        fileInput.click();
    });

    loadFolderBtn.addEventListener('click', event => {
        event.stopPropagation();
        folderInput.click();
    });

    loadUrlBtn.addEventListener('click', event => {
        event.stopPropagation();
        openUrlModal();
    });

    urlForm.addEventListener('submit', event => {
        event.preventDefault();
        addRemoteUrl(urlInput.value);
    });
    urlInput.addEventListener('input', () => { urlError.textContent = ''; });

    dropzone.addEventListener('click', () => fileInput.click());
    $('#btn-mobile-add').addEventListener('click', () => fileInput.click());
    $('#btn-mobile-url').addEventListener('click', openUrlModal);
    dropzone.addEventListener('keydown', event => {
        if (event.target !== dropzone) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', () => {
        addFiles(fileInput.files);
        fileInput.value = '';
    });
    folderInput.addEventListener('change', () => {
        addFiles(folderInput.files);
        folderInput.value = '';
    });

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', playPrevious);
    nextBtn.addEventListener('click', () => playNext(true));
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', cycleRepeat);
    favoriteBtn.addEventListener('click', () => {
        if (state.currentId) toggleFavorite(state.currentId);
    });
    nextUpChip.addEventListener('click', () => playNext(true));

    progressBar.addEventListener('input', event => {
        if (!Number.isFinite(media.duration) || media.duration <= 0) return;
        const percent = Number(event.target.value) / 100;
        media.currentTime = percent * media.duration;
        setProgressUI(Number(event.target.value));
        drawWaveform();
    });
    progressBar.addEventListener('change', () => {
        if (!Number.isFinite(media.duration) || media.duration <= 0) return;
        try { updateSessionPosition(); } catch { /* ignore */ }
    });

    volumeSlider.addEventListener('input', event => setVolume(Number(event.target.value) / 100));
    muteBtn.addEventListener('click', toggleMute);
    speedBtn.addEventListener('click', event => {
        event.stopPropagation();
        togglePopover(speedBtn);
    });
    sleepBtn.addEventListener('click', event => {
        event.stopPropagation();
        togglePopover(sleepBtn);
    });
    accentBtn.addEventListener('click', event => {
        event.stopPropagation();
        togglePopover(accentBtn);
    });

    $$('#speed-popover .popover-item').forEach(item => {
        item.addEventListener('click', () => {
            setSpeed(Number(item.dataset.speed));
            closePopovers();
            toast(`Speed ${speedLabel.textContent}`, { icon: 'fa-gauge-high' });
        });
    });

    $$('#sleep-popover .popover-item').forEach(item => {
        item.addEventListener('click', () => {
            startSleep(Number(item.dataset.sleep));
            closePopovers();
        });
    });

    $$('.swatch').forEach(swatch => {
        swatch.addEventListener('click', () => {
            setAccent(swatch.dataset.accent, true);
            closePopovers();
        });
    });

    commandBtn.addEventListener('click', openCommandPalette);
    shortcutsBtn.addEventListener('click', openShortcuts);
    visualizerBtn.addEventListener('click', event => {
        event.stopPropagation();
        cycleVisualizer();
    });

    viewport.addEventListener('click', event => {
        if (event.target.closest('button')) return;
        if (event.target.tagName === 'VIDEO') return;
        cycleVisualizer();
    });
    viewport.addEventListener('dblclick', event => {
        const track = getCurrentTrack();
        if (!track || track.kind !== 'video' || event.target.tagName !== 'VIDEO') return;
        toggleFullscreen();
    });

    pipBtn.addEventListener('click', togglePip);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    globalSearch.addEventListener('input', () => {
        state.search = globalSearch.value;
        renderLibrary();
    });

    sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        saveSettings();
        renderLibrary();
    });

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            state.view = button.dataset.view;
            saveSettings();
            renderLibrary();
        });
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            state.filter = button.dataset.filter;
            filterButtons.forEach(item => {
                const active = item === button;
                item.classList.toggle('active', active);
                item.setAttribute('aria-selected', active ? 'true' : 'false');
            });
            renderLibrary();
        });
    });

    eqPresetSelect.addEventListener('change', () => {
        setEqPreset(eqPresetSelect.value, true);
    });

    eqSliders.forEach(slider => {
        slider.addEventListener('input', setCustomEqFromSliders);
    });

    eqResetBtn.addEventListener('click', () => {
        setEqPreset('flat', true);
    });

    clearQueueBtn.addEventListener('click', () => {
        if (!state.queue.length) {
            toast('The queue is already empty', { icon: 'fa-list-ul', tone: 'warn' });
            return;
        }
        stopPlayback();
        toast('Queue cleared', { icon: 'fa-trash-can' });
    });

    libraryList.addEventListener('click', event => {
        const favorite = event.target.closest('[data-fav-id]');
        if (favorite) {
            event.stopPropagation();
            toggleFavorite(favorite.dataset.favId);
            return;
        }
        const item = event.target.closest('[data-track-id]');
        if (!item) return;
        const id = item.dataset.trackId;
        if (id === state.currentId && !media.paused) return;
        loadTrack(id, true);
    });

    libraryList.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        if (event.target.closest('button')) return;
        const item = event.target.closest('[data-track-id]');
        if (!item) return;
        event.preventDefault();
        loadTrack(item.dataset.trackId, true);
    });

    queueList.addEventListener('click', event => {
        const remove = event.target.closest('[data-remove-id]');
        if (remove) {
            event.stopPropagation();
            removeFromQueue(remove.dataset.removeId);
            return;
        }
        const item = event.target.closest('[data-queue-id]');
        if (!item) return;
        loadTrack(item.dataset.queueId, true);
    });

    // ---------- Drag and drop ----------
    function hasFiles(event) {
        return Boolean(event.dataTransfer && Array.from(event.dataTransfer.types || []).includes('Files'));
    }

    window.addEventListener('dragenter', event => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        state.dragCounter += 1;
        dropOverlay.classList.add('active');
        dropOverlay.setAttribute('aria-hidden', 'false');
    });
    window.addEventListener('dragover', event => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    window.addEventListener('dragleave', event => {
        if (!hasFiles(event) && !state.dragCounter) return;
        state.dragCounter = Math.max(0, state.dragCounter - 1);
        if (state.dragCounter === 0) {
            dropOverlay.classList.remove('active');
            dropOverlay.setAttribute('aria-hidden', 'true');
        }
    });
    window.addEventListener('drop', event => {
        if (!hasFiles(event)) return;
        event.preventDefault();
        state.dragCounter = 0;
        dropOverlay.classList.remove('active');
        dropOverlay.setAttribute('aria-hidden', 'true');
        addFiles(event.dataTransfer.files);
    });

    // ---------- Modal / document events ----------
    $$('[data-close]').forEach(element => {
        element.addEventListener('click', () => {
            const modal = document.getElementById(element.dataset.close);
            if (modal) closeModal(modal);
        });
    });

    commandInput.addEventListener('input', () => {
        state.commandIndex = 0;
        renderCommandResults(commandInput.value);
    });
    commandInput.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveCommandSelection(1);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveCommandSelection(-1);
        } else if (event.key === 'Enter') {
            event.preventDefault();
            runCommand(state.commandIndex);
        }
    });
    commandResults.addEventListener('click', event => {
        const item = event.target.closest('[data-command-index]');
        if (!item) return;
        runCommand(Number(item.dataset.commandIndex));
    });

    document.addEventListener('click', event => {
        if (!event.target.closest('.popover-anchor')) closePopovers();
    });

    document.addEventListener('fullscreenchange', () => {
        videoPlayer.controls = document.fullscreenElement === videoPlayer;
        const icon = $('i', fullscreenBtn);
        if (icon) icon.className = `fa-solid ${document.fullscreenElement ? 'fa-compress' : 'fa-expand'}`;
        window.setTimeout(handleResize, 80);
    });
    videoPlayer.addEventListener('enterpictureinpicture', () => {
        const icon = $('i', pipBtn);
        if (icon) icon.className = 'fa-solid fa-clone';
    });
    videoPlayer.addEventListener('leavepictureinpicture', () => {
        const icon = $('i', pipBtn);
        if (icon) icon.className = 'fa-solid fa-clone';
    });

    window.addEventListener('beforeunload', () => {
        stopYouTube();
        if (state.currentObjectURL) URL.revokeObjectURL(state.currentObjectURL);
        saveSettings();
    });

    // ---------- Keyboard ----------
    document.addEventListener('keydown', event => {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            openCommandPalette();
            return;
        }

        if (event.key === 'Escape') {
            const openModalElement = $('.modal:not([hidden])');
            if (openModalElement) closeModal(openModalElement);
            else if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            else closePopovers();
            return;
        }

        if ($('.modal:not([hidden])')) return;

        const active = document.activeElement;
        const typing = active && (active.tagName === 'INPUT' || active.tagName === 'SELECT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (typing) return;

        const onControl = active && active.closest('button, a, input, select, textarea, [role="button"]');
        if (onControl && (event.key === ' ' || event.key === 'Enter')) return;

        switch (event.key) {
            case ' ':
                event.preventDefault();
                togglePlay();
                break;
            case 'ArrowRight':
                if (state.currentId) {
                    event.preventDefault();
                    media.currentTime = Math.min(media.duration || 0, media.currentTime + (event.shiftKey ? 30 : 5));
                    drawWaveform();
                }
                break;
            case 'ArrowLeft':
                if (state.currentId) {
                    event.preventDefault();
                    media.currentTime = Math.max(0, media.currentTime - (event.shiftKey ? 30 : 5));
                    drawWaveform();
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                setVolume(state.volume + 0.05);
                break;
            case 'ArrowDown':
                event.preventDefault();
                setVolume(state.volume - 0.05);
                break;
            case '/':
                event.preventDefault();
                globalSearch.focus();
                globalSearch.select();
                break;
            case '?':
                event.preventDefault();
                openShortcuts();
                break;
            case 'm':
            case 'M':
                toggleMute();
                break;
            case 'n':
            case 'N':
                playNext(true);
                break;
            case 'p':
            case 'P':
                playPrevious();
                break;
            case 's':
            case 'S':
                toggleShuffle();
                break;
            case 'r':
            case 'R':
                cycleRepeat();
                break;
            case 'v':
            case 'V':
                cycleVisualizer();
                break;
            case 'f':
            case 'F':
                if (state.currentId) toggleFavorite(state.currentId);
                break;
            default:
                break;
        }
    });

    // ---------- Settings application ----------
    function applySettings() {
        document.body.dataset.accent = saved.accent;
        $$('.swatch').forEach(swatch => swatch.classList.toggle('active', swatch.dataset.accent === saved.accent));

        state.volume = saved.volume;
        state.muted = saved.muted;
        applyVolumeState();
        mediaElements.forEach(element => {
            element.defaultPlaybackRate = saved.speed;
            element.playbackRate = saved.speed;
        });
        updateVolumeUI();

        state.repeat = saved.repeat;
        state.shuffle = saved.shuffle;
        state.visualizer = saved.visualizer;
        state.speed = saved.speed;
        state.view = saved.view;
        state.sort = saved.sort;

        sortSelect.value = saved.sort;
        eqPresetSelect.value = saved.eqPreset;
        applyEqValues(saved.eqValues);
        eqStatus.textContent = EQ_PRESET_LABELS[saved.eqPreset] || 'Flat response';

        setSpeed(saved.speed);
        updateShuffleUI();
        updateRepeatUI();
        updateVisualizerUI();
        setAccent(saved.accent, false);

        progressBar.value = 0;
        globalSearch.value = '';
    }

    function renderAll() {
        renderLibrary();
        renderQueue();
        updatePlayerInfo();
        updateNextUp();
        updateQueueMeta();
        drawWaveform();
    }

    applySettings();
    initMediaSession();
    renderAll();
    setStatus('Stopped', 'stopped');
    updatePlayIcon(false);
    applyMediaView(null);
    updateNextUp();
});
