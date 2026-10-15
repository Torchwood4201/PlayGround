(() => {
  const $ = (s) => document.querySelector(s);
  const term = $('#terminal'), input = $('#cmdInput'), form = $('#inputRow');
  const tabsEl = $('#tabs'), shellLabel = $('#shellLabel'), tabStatus = $('#tabStatus');
  const ctxUsed = $('#ctxUsed'), ctxBar = $('#ctxBar'), ctxPct = $('#ctxPct');
  const agentsEl = $('#agents'), todosEl = $('#todos'), agentCount = $('#agentCount');
  const cpuEl = $('#cpu'), ramEl = $('#ram'), netEl = $('#net'), upEl = $('#uptime'), clockEl = $('#clock');
  const cpuBar = $('#cpuBar'), ramBar = $('#ramBar'), cwdLabel = $('#cwdLabel');

  const state = {
    tabs: [{ name: 'main', lines: [], claude: false, busy: false }],
    active: 0,
    tokens: 12480, sound: true,
    todos: [
      { t: 'Boot TRON shell + verify panels', done: true },
      { t: 'Run `claude` then ask for a ticket stack', done: false },
      { t: 'Try Composer (Ctrl+Space) for a long prompt', done: false },
      { t: 'Open Mobile Pair + simulate phone', done: false },
    ],
    agents: [],
    start: Date.now(),
  };

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  function print(html, cls='line'){ const d=document.createElement('div'); d.className=cls; d.innerHTML=html; term.appendChild(d); term.scrollTop=term.scrollHeight; }
  function printText(t, cls='line'){ print(esc(t), cls); }
  function beep(f=660){ if(!state.sound) return; try{ const C=new (window.AudioContext||window.webkitAudioContext)(); const o=C.createOscillator(),g=C.createGain(); o.frequency.value=f; o.type='square'; g.gain.value=0.03; o.connect(g); g.connect(C.destination); o.start(); setTimeout(()=>{o.stop();C.close();},90);}catch(e){} }

  function renderTabs(){
    tabsEl.innerHTML='';
    state.tabs.forEach((t,i)=>{
      const b=document.createElement('button');
      b.className='tab'+(i===state.active?' active':'');
      const dot = t.busy?'🟢':(t.claude?'🔵':'⚪');
      b.innerHTML=`<span class="tdot">${dot}</span>${esc(t.name)}${t.claude?' ·claude':''}`;
      b.onclick=()=>{state.active=i; renderTabs(); renderTerm(); input.focus();};
      tabsEl.appendChild(b);
    });
    const cur=state.tabs[state.active];
    shellLabel.textContent=(cur.claude?'claude — ':'zsh — ')+'~/projects/soa-web ['+cur.name+']';
    tabStatus.textContent = cur.busy?'● generating':(cur.claude?'● claude live':'● idle');
    tabStatus.className='mono tab-status '+(cur.busy?'busy':(cur.claude?'':'idle'));
  }
  function renderTerm(){
    term.innerHTML='';
    state.tabs[state.active].lines.forEach(l=>print(l.html,l.cls));
    print('<span class="cursor"></span>','line dim');
    term.scrollTop=term.scrollHeight;
  }
  function push(html,cls='line'){ state.tabs[state.active].lines.push({html,cls}); print(html,cls); const c=term.querySelector('.cursor'); if(c) c.remove(); print('<span class="cursor"></span>','line dim'); }
  function setTokens(n){ state.tokens=Math.min(200000,n); ctxUsed.textContent=state.tokens.toLocaleString(); const p=Math.round(state.tokens/2000); ctxBar.style.width=p+'%'; ctxPct.textContent=p+'%'; }

  const AGENT_NAMES=['explore','plan-critic','ticket-writer','review-adv','test-runner','doc-scribe'];
  function setAgents(list){ state.agents=list; agentCount.textContent=list.length;
    agentsEl.innerHTML = list.length? '' : '<li class="muted">No subagents running. Ask Claude to build something.</li>';
    list.forEach(a=>{ const li=document.createElement('li'); li.innerHTML=`<span class="statusdot ${a.st==='run'?'st-run':a.st==='wait'?'st-wait':'st-done'}"></span><b>${esc(a.name)}</b> <span class="muted">· ${esc(a.desc)} · ${a.st}</span>`; agentsEl.appendChild(li); });
  }
  function renderTodos(){ todosEl.innerHTML=''; state.todos.forEach((t,i)=>{ const li=document.createElement('li'); li.className=t.done?'done':''; li.innerHTML=`<input type="checkbox" ${t.done?'checked':''} data-i="${i}" aria-label="todo"/> ${esc(t.t)}`; todosEl.appendChild(li); });
    todosEl.querySelectorAll('input').forEach(c=>c.onchange=(e)=>{ state.todos[+e.target.dataset.i].done=e.target.checked; renderTodos(); beep(520); });
  }

  function boot(){
    renderTabs(); renderTodos(); setAgents([]); setTokens(12480);
    const lines=[
      ['SON OF ANTON <span class="mag">v2.4-web</span> — TRON shell online. SwiftShader-free: pure DOM + CSS render.', 'line'],
      ['<span class="dim">auth:</span> <span class="ok">no keys needed — local simulation</span> · <span class="dim">pty:</span> virtual · <span class="dim">bridge:</span> ws://localhost:7330 (sim)', 'line dim'],
      ['Type <span class="in">help</span> for commands. Type <span class="in">claude</span> to enter the Claude Code session, then describe a build.', 'line'],
      ['<span class="warn">demo tip:</span> press “▶ Run demo task” or run: <span class="in">claude</span> → <span class="in">build me a ticket stack for hamburger optimisation</span>', 'line dim'],
    ];
    lines.forEach(([h,c])=>{ state.tabs[0].lines.push({html:h,cls:c}); });
    renderTerm(); drawQR();
  }

  function help(){
    push('<span class="in">commands</span> — help · ls · pwd · clear · claude · exit · status · theme [neon|amber|matrix] · sound [on|off]');
    push('<span class="dim">tabs</span> — newtab [name] · tabs · use [name] · closetab');
    push('<span class="dim">sim</span> — pair · composer · voice · demo · reset · agents · todos');
    push('<span class="dim">inside claude:</span> ask anything, e.g. “plan dark-mode + tests” — watch AGENTS + TODO + CONTEXT move.');
  }

  async function claudeRun(prompt){
    const tab=state.tabs[state.active]; tab.busy=true; renderTabs();
    const steps=[`grill-me: surfacing assumptions for “${esc(prompt.slice(0,80))}”…`,'plan → 4 tickets · ordered · dependency-aware','spawning subagents…','adversarial review pass (assuming corners were cut)…','reconciling ledger vs git…'];
    push(`<span class="mag">◆ anton</span> received: ${esc(prompt)}`);
    setTokens(state.tokens+1200+Math.floor(Math.random()*800));
    const agents=AGENT_NAMES.slice(0,3+Math.floor(Math.random()*2)).map((n,i)=>({name:n,desc:['scanning repo','writing tickets','critic review','running checks'][i%4],st:'run'}));
    setAgents(agents);
    for(const s of steps){ push(`<span class="dim">… ${s}</span>`,'line dim'); await wait(420); setTokens(state.tokens+340); }
    agents.forEach(a=>a.st='done'); setAgents(agents);
    if(!state.todos.some(t=>!t.done)){ state.todos.push({t:'Review ticket stack before PR opens',done:false}); }
    const open=state.todos.find(t=>!t.done); if(open){ open.done=false; }
    state.todos.forEach((t,i)=>{ if(i<2) t.done=true; });
    renderTodos();
    push(`<span class="ok">✓ done.</span> Ticket stack ready: <span class="in">plan → tickets → review → PR-gated closeout</span>. Nothing merges without you — 3 human gates hold.`);
    push(`<span class="dim">context +${(900+Math.floor(Math.random()*600)).toLocaleString()} · agents ${agents.length} · todos updated. Try “status” or “agents”.</span>`,'line dim');
    tab.busy=false; renderTabs(); beep(880);
  }
  const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

  function handle(raw){
    const cmd=raw.trim(); const tab=state.tabs[state.active];
    if(!cmd) return;
    push(`<span class="in">➜</span> ${esc(cmd)}`);
    beep(440);
    const [base,...rest]=cmd.split(/\s+/); const arg=rest.join(' ');
    const low=base.toLowerCase();
    if(tab.claude && !['exit','clear','help','status','agents','todos'].includes(low) && !cmd.startsWith('/')){ claudeRun(cmd); return; }
    switch(low){
      case 'help': help(); break;
      case 'ls': push('server/ &nbsp; web/public/ &nbsp; mobile/dist/ &nbsp; .agents/skills/ &nbsp; orchestrator.config.json &nbsp; AGENTS.md'); break;
      case 'pwd': push('~/projects/soa-web'); break;
      case 'whoami': push('anton-operator — clearance: TRON'); break;
      case 'clear': tab.lines=[]; renderTerm(); break;
      case 'claude': tab.claude=true; push('<span class="mag">◆ claude session live.</span> Context, agents & todos are now wired to this tab. Ask for a build. (<span class="dim">exit</span> to leave)'); renderTabs(); beep(760); break;
      case 'exit': tab.claude=false; setAgents([]); push('<span class="dim">left claude session. Panels frozen.</span>'); renderTabs(); break;
      case 'status': push(`tokens <b>${state.tokens.toLocaleString()}</b> · agents <b>${state.agents.length}</b> · tab <b>${esc(tab.name)}</b> · claude <b>${tab.claude?'on':'off'}</b> · perm <b>${esc($('#permSelect').value)}</b>`); break;
      case 'agents': push(state.agents.length? state.agents.map(a=>`· ${esc(a.name)} — ${esc(a.desc)} [${a.st}]`).join('<br>') : '<span class="dim">no agents. Enter claude + prompt.</span>'); break;
      case 'todos': push(state.todos.map(t=>`${t.done?'[x]':'[ ]'} ${esc(t.t)}`).join('<br>')); break;
      case 'theme': { const t=(arg||'neon').toLowerCase(); document.body.dataset.theme = t==='neon'?'':t; push(`theme → <b>${esc(t||'neon')}</b>`); break; }
      case 'sound': state.sound = arg.toLowerCase()!=='off'; push(`sound ${state.sound?'<span class="ok">on</span>':'<span class="warn">off</span>'}`); break;
      case 'newtab': { const n=arg||('tab-'+(state.tabs.length+1)); state.tabs.push({name:n,lines:[],claude:false,busy:false}); state.active=state.tabs.length-1; renderTabs(); renderTerm(); push(`<span class="dim">new tab “${esc(n)}”.</span>`); break; }
      case 'tabs': push(state.tabs.map((t,i)=>`${i===state.active?'›':'·'} ${esc(t.name)}${t.claude?' (claude)':''}`).join('<br>')); break;
      case 'use': { const i=state.tabs.findIndex(t=>t.name===arg); if(i>=0){state.active=i;renderTabs();renderTerm();} else push('<span class="err">no such tab: '+esc(arg)+'</span>'); break; }
      case 'closetab': if(state.tabs.length>1){ state.tabs.splice(state.active,1); state.active=0; renderTabs(); renderTerm(); } else push('<span class="warn">cannot close last tab</span>'); break;
      case 'pair': openModal('#pairModal'); break;
      case 'composer': openModal('#composerModal'); setTimeout(()=>$('#composerText').focus(),50); break;
      case 'voice': toggleVoice(); break;
      case 'demo': demo(); break;
      case 'reset': location.reload(); break;
      default: push(`<span class="err">not found:</span> ${esc(base)} — try <span class="in">help</span>`);
    }
  }

  function demo(){
    const tab=state.tabs[state.active];
    if(!tab.claude){ tab.claude=true; renderTabs(); push('<span class="mag">◆ claude session live (demo).</span>'); }
    claudeRun('demo: hamburger optimisation ticket stack with grill-me + adversarial review');
  }

  // modals
  function openModal(s){ $(s).hidden=false; } function closeModal(s){ $(s).hidden=true; }
  $('#composerBtn').onclick=()=>{openModal('#composerModal'); setTimeout(()=>$('#composerText').focus(),50);};
  $('#composerClose').onclick=()=>closeModal('#composerModal');
  $('#composerSend').onclick=()=>{ const v=$('#composerText').value.trim(); if(v){ closeModal('#composerModal'); $('#composerText').value=''; handle(v);} };
  $('#composerText').addEventListener('keydown',(e)=>{ if(e.shiftKey&&e.key==='Enter'){ e.preventDefault(); $('#composerSend').click(); }});
  document.addEventListener('keydown',(e)=>{ if(e.ctrlKey&&e.code==='Space'){ e.preventDefault(); openModal('#composerModal'); setTimeout(()=>$('#composerText').focus(),50);} if(e.key==='Escape'){closeModal('#composerModal');closeModal('#pairModal');} });
  $('#pairBtn').onclick=()=>openModal('#pairModal');
  $('#pairClose').onclick=()=>closeModal('#pairModal');
  $('#pairSimBtn').onclick=()=>{ $('#pairStatus').textContent='status: phone connected ✓ — mirroring tab “'+state.tabs[state.active].name+'” (simulated)'; beep(920); const t=state.todos.find(x=>x.t.includes('Mobile Pair')); if(t){t.done=true;renderTodos();} };
  document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',(e)=>{ if(e.target===m) m.hidden=true; }));
  $('#newTabBtn').onclick=()=>handle('newtab');
  $('#demoBtn').onclick=demo;
  $('#resetBtn').onclick=()=>location.reload();
  $('#permSelect').onchange=(e)=>{ push(`permission mode → <b>${esc(e.target.value)}</b> ${e.target.value==='YOLO'?'<span class="warn">(you own the blast radius)</span>':''}`); };
  form.onsubmit=(e)=>{ e.preventDefault(); const v=input.value; input.value=''; handle(v); input.focus(); };

  // fake QR pattern
  function drawQR(){ const c=$('#qr'); const x=c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,148,148); x.fillStyle='#000';
    const n=21,s=148/n; const rnd=(i,j)=>((i*7+j*13+i*j)%3!==0);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){ const corner=(i<7&&j<7)||(i>13&&j<7)||(i<7&&j>13); if(corner){ const ci=i<7?(i):(i>13?i-14:i), cj=j<7?(j):(j>13?j-14:j); const edge=ci===0||ci===6||cj===0||cj===6, core=ci>1&&ci<5&&cj>1&&cj<5; if(edge||core) x.fillRect(i*s,j*s,s,s);} else if(rnd(i,j)) x.fillRect(i*s,j*s,s,s); }
    x.fillStyle='#00c8d8'; x.fillRect(9*s,9*s,3*s,3*s);
  }

  // voice visualizer
  let vizOn=false, vizRAF=null;
  function toggleVoice(){ vizOn=!vizOn; $('#vizWrap').hidden=!vizOn; $('#voiceBtn').textContent=vizOn?'⏹ Stop voice':'🎙 Voice';
    if(vizOn){ push('<span class="dim">voice… listening (simulated Web Speech fallback). Speak, then type anyway. </span>'); const c=$('#viz'),x=c.getContext('2d'); const draw=()=>{ if(!vizOn) return; x.fillStyle='#000'; x.fillRect(0,0,c.width,c.height); for(let i=0;i<32;i++){ const h=6+Math.random()*44; const g=x.createLinearGradient(0,56-h,0,56); g.addColorStop(0,'#00f0ff'); g.addColorStop(1,'#ff2bd6'); x.fillStyle=g; x.fillRect(i*18+4,56-h,10,h);} vizRAF=requestAnimationFrame(()=>setTimeout(draw,120)); }; draw();
      const t=state.todos.find(v=>v.t.includes('Composer')); if(t){/* keep */}
    } else { if(vizRAF) cancelAnimationFrame(vizRAF); push('<span class="dim">voice stopped.</span>'); }
  }
  $('#voiceBtn').onclick=toggleVoice;

  // clocks + fake sys stats
  const t0=Date.now();
  function fmt(ms){ const s=Math.floor(ms/1000); const h=String(Math.floor(s/3600)).padStart(2,'0'),m=String(Math.floor(s%3600/60)).padStart(2,'0'),ss=String(s%60).padStart(2,'0'); return `${h}:${m}:${ss}`; }
  setInterval(()=>{ const d=new Date(); clockEl.textContent=d.toTimeString().slice(0,8); upEl.textContent=fmt(Date.now()-t0);
    const cpu=8+Math.round(Math.random()*30+(state.tabs[state.active].busy?25:0));
    const ram=38+Math.round(Math.random()*10);
    cpuEl.textContent=cpu+'%'; cpuBar.style.width=cpu+'%'; ramEl.textContent=ram+'%'; ramBar.style.width=ram+'%';
    netEl.textContent=(0.6+Math.random()*3).toFixed(1)+' Mb/s';
  },1500);

  boot();
})();
