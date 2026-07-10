/* ============================================================
   Aayushi.PM — interactive hero terminal
   Scripted, client-side only. Types intro, accepts commands.
   ============================================================ */
(function () {
  const body  = document.getElementById('termBody');
  const input = document.getElementById('termInput');
  const stateEl = document.getElementById('termState');
  if (!body || !input) return;

  const TYPE_MS = 16;     // per-char
  const LINE_GAP = 180;   // pause between lines

  // ---- helpers ---------------------------------------------------
  function el(cls) { const d = document.createElement('div'); d.className = cls; return d; }
  function scrollEnd() { body.scrollTop = body.scrollHeight; }

  // print a fully-formed line instantly (html allowed via segments)
  function printLine(html, cls) {
    const line = el('term-line' + (cls ? ' ' + cls : ''));
    line.innerHTML = html;
    body.appendChild(line);
    scrollEnd();
    return line;
  }
  function gap() { const g = el('term-line gap'); body.appendChild(g); scrollEnd(); }

  // type a line made of segments [{t, c}] char-by-char with a live caret
  function typeLine(segments) {
    return new Promise((resolve) => {
      const line = el('term-line');
      body.appendChild(line);
      const caret = document.createElement('span');
      caret.className = 'caret';
      line.appendChild(caret);
      const flat = [];
      segments.forEach(s => { for (const ch of s.t) flat.push({ ch, c: s.c }); });
      let i = 0;
      function step() {
        if (i < flat.length) {
          const sp = document.createElement('span');
          if (flat[i].c) sp.className = flat[i].c;
          sp.textContent = flat[i].ch;
          line.insertBefore(sp, caret);
          i++;
          scrollEnd();
          setTimeout(step, TYPE_MS + (flat[i-1].ch === ' ' ? 8 : 0));
        } else {
          caret.remove();
          resolve(line);
        }
      }
      step();
    });
  }
  function wait(ms){ return new Promise(r => setTimeout(r, ms)); }

  // ---- command outputs -------------------------------------------
  function scrollTo(sel) {
    const t = document.querySelector(sel);
    if (!t) return;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  }
  function go(url) { setTimeout(() => { window.location.href = url; }, 700); }

  const RESPONSES = {
    help() {
      printLine('<span class="out">available commands —</span>');
      printLine('<span class="key">whoami</span><span class="out">     who I am &amp; what I do → /about</span>');
      printLine('<span class="key">work</span><span class="out">       what I\'ve built → /work</span>');
      printLine('<span class="key">case</span><span class="out">       deep dives + writing → /case-studies</span>');
      printLine('<span class="key">experience</span><span class="out"> career log → /experience</span>');
      printLine('<span class="key">skills</span><span class="out">     capability matrix → /about</span>');
      printLine('<span class="key">contact</span><span class="out">    start a conversation</span>');
      printLine('<span class="key">clear</span><span class="out">      reset the session</span>');
    },
    whoami() {
      printLine('<span class="out">Aayushi · AI Product Manager — 0&#8594;1 agentic products.</span>');
      printLine('<span class="out">routing to </span><span class="key">/about</span> <span class="dim">···</span>');
      go('index.html#about');
    },
    projects() {
      printLine('<span class="out">opening </span><span class="key">/work</span><span class="out"> — Lumi · MISO </span><span class="dim">···</span>');
      go('projects.html');
    },
    casestudies() {
      printLine('<span class="out">opening </span><span class="key">/case-studies</span><span class="out"> — deep dives + writing </span><span class="dim">···</span>');
      go('case-studies.html');
    },
    lumi() {
      printLine('<span class="out">loading </span><span class="key">Lumi</span><span class="out"> — 3-layer Gemini arch </span><span class="dim">···</span>');
      go('lumi.html');
    },
    miso() {
      printLine('<span class="out">loading </span><span class="key">MISO</span><span class="out"> — optimization agent </span><span class="dim">···</span>');
      go('miso.html');
    },
    experience() {
      printLine('<span class="out">Lumi · Cograph · CyMed · Beenos — rendering career log </span><span class="dim">···</span>');
      go('experience.html');
    },
    skills() {
      printLine('<span class="out">capability matrix — Product Building · AI Eval · 0&#8594;1 · Growth </span><span class="dim">···</span>');
      go('index.html#skills');
    },
    contact() {
      printLine('<span class="out">Status: </span><span class="key">available for AI PM roles</span><span class="out">. opening channel </span><span class="dim">···</span>');
      scrollTo('#contact');
    },
    clear() {
      body.innerHTML = '';
      printLine('<span class="dim">session cleared. type</span> <span class="key">help</span> <span class="dim">for commands.</span>');
    }
  };

  const ALIASES = { about:'whoami', work:'projects', products:'projects', ai_products:'projects', career:'experience', capabilities:'skills', 'case':'casestudies', writing:'casestudies', '?':'help', ls:'help', man:'help' };

  function run(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    printLine('<span class="prompt">aayushi ~ %</span> <span class="usr">' + escapeHtml(raw) + '</span>');
    const key = ALIASES[cmd] || cmd;
    if (RESPONSES[key]) { RESPONSES[key](); }
    else {
      printLine('<span class="warn">command not found: ' + escapeHtml(cmd) + '</span>');
      printLine('<span class="dim">try</span> <span class="key">help</span> <span class="dim">— or:</span> <span class="key">whoami work case contact</span>');
    }
    gap();
  }

  function escapeHtml(s){ return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

  // ---- boot sequence ---------------------------------------------
  async function boot() {
    stateEl.textContent = 'booting';
    await wait(350);
    printLine('<span class="prompt">aayushi ~ %</span> <span class="usr">./intro</span>');
    await wait(260);
    printLine('<span class="dim">[ok] loading portfolio</span>', 'dim');
    await wait(180);
    stateEl.textContent = 'online';
    gap();
    await typeLine([
      { t: "I'm ", c: 'out' }, { t: 'Aayushi', c: 'key' },
      { t: ' — an AI Product Manager who ships ', c: 'out' },
      { t: '0\u21921 agentic products', c: 'usr' }, { t: '.', c: 'out' }
    ]);
    await wait(LINE_GAP);
    await typeLine([
      { t: '3+ yrs · LLM agents · voice + behavioral systems · eval & guardrails.', c: 'out' }
    ]);
    await wait(LINE_GAP);
    gap();
    printLine('<span class="dim">type a command or tap a pill below.</span>');
    printLine('<span class="dim">try:</span> <span class="key">whoami</span> <span class="key">work</span> <span class="key">case</span> <span class="key">contact</span>');
    gap();
    input.removeAttribute('disabled');
  }

  // ---- wiring ----------------------------------------------------
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; run(v); }
  });
  document.querySelectorAll('[data-cmd]').forEach(p => {
    p.addEventListener('click', () => { run(p.getAttribute('data-cmd')); input.focus(); });
  });
  // focus terminal when clicking its body
  body.addEventListener('click', () => input.focus());

  boot();
})();
