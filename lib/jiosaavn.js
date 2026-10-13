const axios = require('axios');
const CryptoJS = require('crypto-js');

// JioSaavn client built on JioSaavn's official web endpoints
// (same ones www.jiosaavn.com uses). No third-party proxy required.
const SAAVN_API = 'https://www.jiosaavn.com/api.php';
const MEDIA_KEY = '38346591';

class JioSaavn {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.jiosaavn.com/',
      'Origin': 'https://www.jiosaavn.com',
      'Connection': 'keep-alive'
    };
  }

  decryptMediaUrl(encrypted) {
    if (!encrypted) throw new Error('Empty encrypted media URL');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encrypted) },
      CryptoJS.enc.Utf8.parse(MEDIA_KEY),
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    ).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error('Failed to decrypt media URL');
    // Saavn serves _96 and _320 variants; prefer 320kbps when advertised.
    return decrypted.replace('http://', 'https://');
  }

  pickStreamUrl(rawSong) {
    const enc = rawSong.more_info && rawSong.more_info.encrypted_media_url;
    let url = this.decryptMediaUrl(enc);
    if (rawSong.more_info && String(rawSong.more_info['320kbps']).toLowerCase() === 'true') {
      url = url.replace('_96.mp4', '_320.mp4');
    } else {
      url = url.replace('_320.mp4', '_96.mp4');
    }
    return url;
  }

  async searchSongs(query, limit = 10) {
    const url = `${SAAVN_API}?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=${limit}&__call=search.getResults`;
    const startTime = Date.now();
    const response = await axios.get(url, { headers: this.headers, timeout: 15000 });
    const duration = Date.now() - startTime;
    console.log(`[JioSaavn] status=${response.status} time_ms=${duration} total=${response.data && response.data.total}`);
    if (!response.data || !Array.isArray(response.data.results)) {
      throw new Error('Invalid response format from JioSaavn API');
    }
    return response.data.results.filter((r) => r && r.type === 'song');
  }

  /**
   * Search for music on JioSaavn
   * @param {string} title - Song title
   * @param {string} artist - Artist name(s), comma separated
   * @param {boolean} debug - Enable debug mode
   * @returns {Promise<Object>} Song information with download URL
   */
  async search(title, artist, debug = false) {
    try {
      const decodedArtist = decodeURIComponent(artist || '');
      const requestedArtists = decodedArtist.split(',').map(a => a.trim()).filter(Boolean);
      const query = [title, requestedArtists[0]].filter(Boolean).join(' ');

      console.log(`[JioSaavn] /jiosaavn/search/strict title='${title}' artists='${JSON.stringify(requestedArtists)}'`);

      const songs = await this.searchSongs(query, 10);
      console.log(`[JioSaavn] results_count=${songs.length}`);
      if (songs.length === 0) throw new Error('Music stream not found in JioSaavn results');

      const processedResults = songs.map(rawSong => this._createSongPayload(rawSong));
      const matchingTrack = this._findStrictMatchingTrack(processedResults, title, requestedArtists, debug);
      if (!matchingTrack) throw new Error('Music stream not found in JioSaavn results (Strict Match Failed)');

      const finalResponse = {
        name: matchingTrack.name,
        year: matchingTrack.year,
        copyright: matchingTrack.copyright,
        duration: matchingTrack.duration,
        label: matchingTrack.label,
        albumName: (matchingTrack.album && matchingTrack.album.name) || null,
        artists: [
          ...((matchingTrack.artists && matchingTrack.artists.primary) || []),
          ...((matchingTrack.artists && matchingTrack.artists.featured) || []),
          ...((matchingTrack.artists && matchingTrack.artists.all) || [])
        ],
        downloadUrl: matchingTrack.downloadUrl
      };

      if (debug) {
        finalResponse._debug = { queried: query, matched_artists: matchingTrack.artists };
      }
      return finalResponse;
    } catch (error) {
      console.error(`[JioSaavn][ERR] ${error.message}`);
      throw new Error(`JioSaavn search failed: ${error.message}`);
    }
  }

  /**
   * Search for all music results on JioSaavn
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @param {boolean} debug - Enable debug mode
   * @returns {Promise<Object>} All matching songs
   */
  async searchAll(query, limit = 10, debug = false) {
    try {
      console.log(`[JioSaavn] /jiosaavn/search/all q='${query}' limit=${limit}`);
      const songs = await this.searchSongs(query, limit);
      console.log(`[JioSaavn] results_count=${songs.length}`);
      if (songs.length === 0) return { results: [] };
      const processedResults = songs.slice(0, limit).map(rawSong => this._createSongPayload(rawSong));
      console.log(`[JioSaavn] processed_count=${processedResults.length} sample_titles=${processedResults.slice(0, 3).map(r => r.name)}`);
      const response_data = { query, total: processedResults.length, results: processedResults };
      if (debug) response_data._debug = { queried: query };
      return response_data;
    } catch (error) {
      console.error(`[JioSaavn][ERR] ${error.message}`);
      throw new Error(`JioSaavn search all failed: ${error.message}`);
    }
  }

  // Private helper methods

  _createSongPayload(rawSong) {
    const info = rawSong.more_info || {};
    const artistMap = info.artistMap || {};
    const mapArtist = (a) => ({ name: (a && a.name) || '', id: (a && a.id) || '', role: (a && a.role) || '' });
    let downloadUrl = '';
    try { downloadUrl = this.pickStreamUrl(rawSong); } catch (e) { downloadUrl = ''; }
    const lastImage = (s) => {
      if (!s) return '';
      const parts = String(s).split(',');
      return parts[parts.length - 1].trim();
    };
    return {
      id: rawSong.id || '',
      name: rawSong.title || '',
      year: rawSong.year || '',
      copyright: info.copyright_text || '',
      duration: info.duration || '',
      label: info.label || '',
      album: { name: info.album || '', id: info.album_id || '' },
      artists: {
        primary: (artistMap.primary_artists || []).map(mapArtist),
        featured: (artistMap.featured_artists || []).map(mapArtist),
        all: (artistMap.artists || []).map(mapArtist)
      },
      downloadUrl,
      image: lastImage(rawSong.image),
      language: rawSong.language || '',
      hasLyrics: info.has_lyrics === true || String(info.has_lyrics).toLowerCase() === 'true'
    };
  }

  _findStrictMatchingTrack(processedResults, title, requestedArtists, debug) {
    const normalizeString = (text) => {
      return (text || '').toString().trim().toLowerCase().replace(/[^\w\s]/g, '');
    };

    const normalizedRequestedArtists = new Set(requestedArtists.map(a => normalizeString(a)));
    const requiredCount = normalizedRequestedArtists.size;

    console.log(`[JioSaavn][Strict] Searching for title='${title}' with ${requiredCount} artists: ${[...normalizedRequestedArtists].join(', ')}`);

    // First pass: strict (title + artist set). Second pass: title only.
    for (const strict of [true, false]) {
      for (const track of processedResults) {
        if (!track.downloadUrl) continue;
        const trackName = normalizeString(track.name);
        const searchTitle = normalizeString(title);
        const titleMatches = trackName.includes(searchTitle) || searchTitle.includes(trackName);
        if (!titleMatches) continue;
        if (!strict || requiredCount === 0) return track;

        const primaryArtists = (track.artists?.primary || []).map(a => a.name);
        const trackArtistsNormalized = new Set(primaryArtists.map(a => normalizeString(a)));
        if (trackArtistsNormalized.size !== requiredCount) continue;
        const allFound = [...normalizedRequestedArtists].every(reqArtist =>
          [...trackArtistsNormalized].some(trackArtist => trackArtist.includes(reqArtist) || reqArtist.includes(trackArtist))
        );
        if (allFound) return track;
        if (debug) console.log(`[JioSaavn][Strict] Track: '${track.name}' Artists: [${primaryArtists.join(', ')}] skipped (artist mismatch)`);
      }
    }

    console.log('[JioSaavn][Strict] No match found.');
    return null;
  }
}

module.exports = JioSaavn;
