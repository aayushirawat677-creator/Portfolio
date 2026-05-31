/* ============================================================
   AAYUSHI.AGENT — shared site behavior (all pages)
   nav state · active link · reveals · ambient · clock
   ============================================================ */
(function () {
  // ---- active nav link + home contact shortcut ----
  const file = (location.pathname.split('/').pop() || 'index.html');
  const page = decodeURIComponent(file) || 'index.html';
  const isHome = page === 'index.html' || page === '' || page === 'Aayushi Portfolio.html';
  document.querySelectorAll('[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav') === page) a.classList.add('active');
  });
  if (isHome) {
    const av = document.querySelector('.nav-cta');
    if (av) av.setAttribute('href', '#contact');
  }

  // ---- sticky nav state ----
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- reveal on scroll ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(n => io.observe(n));

  // ---- ambient: cycle "hot" node through diagrams ----
  function cycle(sel, ms) {
    const nodes = Array.from(document.querySelectorAll(sel));
    if (!nodes.length) return;
    let k = 0;
    setInterval(() => {
      nodes.forEach(n => n.classList.remove('hot'));
      nodes[k % nodes.length].classList.add('hot');
      k++;
    }, ms);
  }
  cycle('.pipe-node', 1100);
  cycle('.arch-layer', 1400);

  // ---- footer clock + to-top ----
  const clock = document.getElementById('sessClock');
  if (clock) {
    const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-US', { hour12: false }); };
    tick(); setInterval(tick, 1000);
  }
  const up = document.getElementById('toTop');
  if (up) up.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---- in-page smooth anchors (e.g. #contact) ----
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const sel = a.getAttribute('href');
      if (sel === '#') return;
      const t = document.querySelector(sel);
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    });
  });

  // ---- on-load: if URL has hash, offset for fixed nav ----
  if (location.hash) {
    const t = document.querySelector(location.hash);
    if (t) setTimeout(() => window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - 70 }), 60);
  }
})();
