/* ==========================================================================
   MANUAL KNOWLEDGE for the SNESBoy AI players (`ai/manual-knowledge.js`)
   --------------------------------------------------------------------------
   Distilled from the Internet Archive SNES manual collection
   (snes_manual_archive, 863 PDFs, ~8.5 GB — see ai/manual-index.json for
   the title list and the archive page for the files themselves).

   Only filenames were vendored. Manuals remain the property of their
   publishers; nothing from the archive is redistributed here.

   Verified against primary sources in this repo:
   - platformer: Super Mario All-Stars (USA) — bundled ROM, observed play
   - fighter: Ultimate Mortal Kombat 3 (USA) — full booklet text (pp.4-27),
     incl. RUN=R+Forward, BLOCK=L, crouch/uppercut/spin/jump-in rules and
     the 15-entry special-move strings in script.js UMK3_MOVEBOOK
   Genre profiles marked (heuristic) are conservative conventions shared by
   most SNES titles in that genre — safe starting points, not manual quotes.
   Indices are RetroArch SNES numbers: B=0 Y=1 Select=2 Start=3 Up=4 Down=5
   Left=6 Right=7 A=8 X=9 L=10 R=11.
   ========================================================================== */
(function(){
  'use strict';

  var KNOWLEDGE = {
    source: 'snes_manual_archive (Internet Archive)',
    archiveUrl: 'https://archive.org/details/snes_manual_archive',
    indexFile: 'ai/manual-index.json',

    /* Buttons and menu habits shared by nearly every SNES manual. */
    SNES_COMMON: {
      buttons: { B: 0, Y: 1, SELECT: 2, START: 3, UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7, A: 8, X: 9, L: 10, R: 11 },
      menus: [
        'START advances title screens and confirms menu choices',
        'D-pad Up/Down moves the highlight, Left/Right changes settings',
        'SELECT often toggles options or 1P/2P modes on title screens',
        'Fighter select usually takes any button except START',
        'START during play pauses; some games need a second START to resume'
      ]
    },

    /* Per-genre autopilot presets. Applied on profile select (seekCycle,
       hopEvery, tapMs); the drive loop itself is unchanged. */
    PROFILES: {
      generic: { label: 'Platformer', driver: 'platformer',
        seekCycle: '2,2,3,8,5,4', hopEvery: 3, tapMs: 4000,
        verified: 'Super Mario All-Stars (USA) — bundled ROM, observed play',
        notes: 'Hold scroll direction + run, alternate action buttons, vertical nudges for ladders/doors.' },
      umk3: { label: 'UMK3 Fighter', driver: 'fighter',
        seekCycle: '2,2,3,8,5,4', hopEvery: 3, tapMs: 4000,
        verified: 'Ultimate Mortal Kombat 3 (USA) booklet pp.4-27 (full text)',
        notes: 'RUN+approach, strike flurries, BLOCK phases, crouch uppercuts, jump-ins, manual special strings.' },
      racer: { label: 'Racer (heuristic)', driver: 'platformer',
        seekCycle: '3,8,8,2,5,4', hopEvery: 5, tapMs: 4000,
        verified: null,
        notes: 'Confirm-heavy menus (extra A), calmer action rate. Heuristic — tune per title.' },
      shooter: { label: 'Shooter (heuristic)', driver: 'platformer',
        seekCycle: '2,2,3,8,5,4', hopEvery: 2, tapMs: 4000,
        verified: null,
        notes: 'Rapid action rate for constant fire. Heuristic — tune per title.' },
      rpg: { label: 'RPG / menu-heavy (heuristic)', driver: 'platformer',
        seekCycle: '8,8,3,2,5,4', hopEvery: 4, tapMs: 6000,
        verified: null,
        notes: 'Slow taps, confirm-first cycle for text boxes and inventory menus. Heuristic.' }
    },

    /* Spot-checked entries. verified:true only where the manual text was
       actually read (UMK3 booklet) or the game was observed (All-Stars).
       Everything else points at the archive file + suggested genre. */
    GAMES: [
      { title: 'Super Mario All-Stars (USA)', file: 'Super Mario All-Stars (USA).pdf', bytes: 3057807,
        genre: 'platformer', profile: 'generic', verified: true,
        notes: 'Bundled ROM. D-pad moves, B dash / Y run semantics per on-screen play.' },
      { title: 'Ultimate Mortal Kombat 3 (USA)', file: 'Ultimate Mortal Kombat 3 (USA).pdf', bytes: 3540597,
        genre: 'fighter', profile: 'umk3', verified: true,
        notes: 'Full booklet pp.4-27: RUN=R+Fwd, BLOCK=L, DOWN+Y uppercut, AWAY+kick spins, 15 special strings.' },
      { title: 'Super Mario World (USA)', file: 'Super Mario World (USA).pdf', bytes: 2099279,
        genre: 'platformer', profile: 'generic', verified: false,
        notes: 'Same lineage as All-Stars platforming; start with Platformer.' },
      { title: 'Super Mario Kart (USA)', file: 'Super Mario Kart (USA).pdf', bytes: 2334906,
        genre: 'racer', profile: 'racer', verified: false,
        notes: 'Start with Racer heuristic; confirm accel/brake mapping in-game.' },
      { title: 'Legend of Zelda, The - A Link to the Past (USA)', file: 'Legend of Zelda, The - A Link to the Past (USA).pdf', bytes: 4267975,
        genre: 'adventure', profile: 'rpg', verified: false,
        notes: 'Menu-heavy inventory/text; start with RPG preset.' },
      { title: 'Super Metroid (Japan, USA)', file: 'Super Metroid (Japan, USA).pdf', bytes: 2291538,
        genre: 'platformer', profile: 'generic', verified: false,
        notes: 'Exploration platformer; Platformer preset, extra vertical attention.' },
      { title: 'Street Fighter II (USA)', file: 'Street Fighter II (USA).pdf', bytes: 2210128,
        genre: 'fighter', profile: 'umk3', verified: false,
        notes: 'Fighter motions transfer; UMK3 profile is the closest starting point.' },
      { title: 'Mortal Kombat II (USA) (Rev 1)', file: 'Mortal Kombat II (USA) (Rev 1).pdf', bytes: 1935527,
        genre: 'fighter', profile: 'umk3', verified: false,
        notes: 'Same family as UMK3; UMK3 profile applies.' },
      { title: 'Super Mario RPG - Legend of the Seven Stars (USA)', file: 'Super Mario RPG - Legend of the Seven Stars (USA).pdf', bytes: 3155271,
        genre: 'rpg', profile: 'rpg', verified: false,
        notes: 'Turn-based menus; RPG preset.' },
      { title: 'Mega Man X (USA) (Rev 1)', file: 'Mega Man X (USA) (Rev 1).pdf', bytes: 1071974,
        genre: 'platformer', profile: 'generic', verified: false,
        notes: 'Run-and-gun platformer; Platformer preset with shooter-leaning hop rate.' }
    ]
  };

  function norm(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  /* Match a loaded ROM filename against any entry list ({title} items).
     Returns the entry on a confident substring match, else null — never
     guesses. Tokens under 4 chars are ignored to avoid false hits. */
  KNOWLEDGE.matchTitle = function(romName, entries){
    var n = norm(romName).replace(/\.(sfc|smc|zip)$/, '');
    if(!n) return null;
    var best = null, bestScore = 0;
    (entries || []).forEach(function(g){
      if(!g || !g.title) return;
      var t = norm(g.title);
      var score = 0;
      if(t && (n.indexOf(t) !== -1 || t.indexOf(n) !== -1)) score = 3;
      else {
        var tn = t.split(' ').filter(function(w){ return w.length >= 4; });
        var hit = 0;
        tn.forEach(function(w){ if(n.indexOf(w) !== -1) hit++; });
        if(hit >= 2) score = hit;
      }
      if(score > bestScore){ bestScore = score; best = g; }
    });
    return bestScore > 0 ? best : null;
  };

  /* Match against the spot-checked entries. */
  KNOWLEDGE.matchGame = function(romName){
    return KNOWLEDGE.matchTitle(romName, KNOWLEDGE.GAMES);
  };

  /* Retrieve the few excerpts relevant to a scene: matched game entry (if
     confident), its genre profile notes, and generic menu rules. Always
     labels verified vs heuristic. Never invents page numbers or facts. */
  KNOWLEDGE.retrieve = function(opts){
    opts = opts || {};
    var out = { game: null, matched: false, excerpts: [] };
    var entry = KNOWLEDGE.matchGame(opts.gameTitle);
    if(entry){
      out.game = entry.title; out.matched = true;
      out.excerpts.push({ game: entry.title, page: null,
        section: entry.verified ? 'verified entry' : 'heuristic entry',
        text: entry.notes });
    }
    var prof = KNOWLEDGE.PROFILES[opts.profile];
    if(prof){
      out.excerpts.push({ game: opts.profile, page: null,
        section: prof.verified ? 'verified profile' : 'heuristic profile',
        text: prof.notes });
    }
    var q = norm(opts.query);
    if(q){
      KNOWLEDGE.SNES_COMMON.menus.forEach(function(rule){
        var rw = rule.toLowerCase().split(/[^a-z]+/);
        var qw = q.split(' ');
        for(var i = 0; i < qw.length; i++){
          if(qw[i].length >= 4 && rw.indexOf(qw[i]) !== -1){
            out.excerpts.push({ game: 'SNES common', page: null,
              section: 'menu convention', text: rule });
            break;
          }
        }
      });
    }
    return out;
  };

  /* Pull control-relevant lines out of raw manual text: lines mentioning
     buttons, presses, or moves, plus ALL-CAPS section headers for context.
     Pure text filter — no claims beyond what the page says. */
  KNOWLEDGE.extractControls = function(text, maxLines){
    maxLines = maxLines || 25;
    var out = [];
    String(text || '').split('\n').forEach(function(raw){
      var line = raw.replace(/\s+/g, ' ').trim();
      if(line.length < 4 || line.length > 220) return;
      if(/[A-Z]{5,}/.test(line) || /button|press|control|move|jump|attack|hold|tap|kick|punch|block|run|start|select|d-pad|pad/i.test(line)){
        if(out.indexOf(line) === -1) out.push(line);
      }
    });
    return out.slice(0, maxLines);
  };

  /* Archive download URL for one index filename (follows archive.org
     redirect to the storage node). */
  KNOWLEDGE.archiveFileUrl = function(file){
    return 'https://archive.org/download/snes_manual_archive/' + encodeURIComponent(file);
  };

  /* The archive as a Son of Anton capability: search the vendored index,
     fetch one manual PDF (approval-gated, user-initiated), extract its
     text. State carries file names and byte counts only — never PDF bytes
     through the planner (structuredClone would copy megabytes per node). */
  KNOWLEDGE.manualsCapability = function(host){
    host = host || {};
    function candidatesFor(query, files){
      var q = norm(query).split(' ').filter(function(w){ return w.length >= 4; });
      if(!q.length) return files.slice(0, 8);
      var scored = files.map(function(f){
        var t = norm(f.title);
        var s = 0;
        q.forEach(function(w){ if(t.indexOf(w) !== -1) s++; });
        return { file: f.file, title: f.title, score: s };
      }).filter(function(c){ return c.score > 0; });
      scored.sort(function(a, b){ return b.score - a.score; });
      return scored.slice(0, 8);
    }
    return {
      score: function(state){
        var s = state.reported.length;
        if(state.fetched) s += 2;
        if(state.textChars) s += 2;
        return s;
      },
      satisfied: function(state, goal){
        return !!state.textChars && (!goal.file || state.file === goal.file);
      },
      actions: [
        { name: 'searchIndex',
          cost: 0.1,
          parameters: function(state, goal){
            return [{ query: goal.query || '' }];
          },
          predict: function(state, params){
            var files = [];
            try{
              files = (host.index() || []).map(function(m){
                return { title: m.title, file: m.file };
              });
            }catch(e){}
            state.candidates = candidatesFor(params.query, files);
            return state;
          } },
        { name: 'fetchManual',
          cost: 1,
          parameters: function(state, goal){
            if(goal.file) return [{ file: goal.file }];
            return (state.candidates || []).slice(0, 3).map(function(c){ return { file: c.file }; });
          },
          allowed: function(state, params){
            return !!params.file && !state.fetched;
          },
          predict: function(state, params){
            state.file = params.file;
            state.fetched = true;
            return state;
          },
          execute: function(state, params){
            return Promise.resolve()
              .then(function(){ return host.fetchFile(params.file); })
              .then(function(buf){
                state.file = params.file;
                state.fetched = true;
                state.bytes = buf ? buf.byteLength || buf.length || 0 : 0;
                return state;
              });
          } },
        { name: 'extractControls',
          cost: 0.5,
          parameters: function(){ return [{}]; },
          allowed: function(state){ return !!state.fetched && !state.textChars; },
          predict: function(state){
            state.textChars = -1; /* placeholder until observed */
            return state;
          },
          execute: function(state){
            return Promise.resolve()
              .then(function(){ return host.extractText(state.file); })
              .then(function(text){
                state.textChars = String(text || '').length;
                state.controls = KNOWLEDGE.extractControls(text, 25);
                return state;
              });
          } }
      ]
    };
  };

  if(typeof window !== 'undefined') window.MANUAL_KNOWLEDGE = KNOWLEDGE;
  if(typeof module !== 'undefined' && module.exports) module.exports = KNOWLEDGE;
})();
