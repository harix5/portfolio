(() => {
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll progress under the nav
  const progress = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty('--p', max > 0 ? scrollY / max : 0);
  };
  addEventListener('scroll', progress, { passive: true });
  progress();

  // Sections ease in as they arrive
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); seen.unobserve(e.target); }
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => seen.observe(el));

  // Mark the section in view in the nav
  const links = new Map([...document.querySelectorAll('.nav nav a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach((a) => a.removeAttribute('aria-current'));
      links.get(e.target.id)?.setAttribute('aria-current', 'true');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach((_, id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  // The current role rotates through the three held now
  const role = document.getElementById('role');
  const roles = ['AI trainer at Handshake AI', 'AI data specialist at RWS Group', 'Video annotation specialist at micro1'];
  if (role && !calm) {
    let i = 0;
    setInterval(() => {
      role.classList.add('out');
      setTimeout(() => { role.textContent = roles[i = (i + 1) % roles.length]; role.classList.remove('out'); }, 240);
    }, 2800);
  }

  // Skills tabs
  const tabs = [...document.querySelectorAll('.tab')];
  const show = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('swap', on);
    });
  };
  document.querySelectorAll('.chips').forEach((ul) => [...ul.children].forEach((li, i) => li.style.setProperty('--i', i)));
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t));
    t.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      show(next); next.focus();
    });
  });
  if (tabs.length) show(tabs[0]);

  // Copy the email address
  const copy = document.getElementById('copy');
  copy?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(copy.dataset.copy); copy.textContent = 'Copied'; }
    catch { copy.textContent = 'Press Ctrl+C on the address'; }
    setTimeout(() => { copy.textContent = 'Copy email'; }, 2000);
  });

  // Pointer effects: a square that trails the pointer, and a glow on the welcome screen
  if (calm || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = document.querySelector('.cursor');
  const welcome = document.querySelector('.welcome');
  let tx = 0, ty = 0, x = 0, y = 0, s = 1, ts = 1, raf = 0;
  const tick = () => {
    x += (tx - x) * 0.2; y += (ty - y) * 0.2; s += (ts - s) * 0.2;
    cursor.style.setProperty('--cx', x + 'px');
    cursor.style.setProperty('--cy', y + 'px');
    cursor.style.setProperty('--cs', s);
    raf = Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(ts - s) > 0.05 ? requestAnimationFrame(tick) : 0;
  };
  addEventListener('pointermove', (e) => {
    if (!cursor.classList.contains('on')) { x = e.clientX; y = e.clientY; cursor.classList.add('on'); }
    tx = e.clientX; ty = e.clientY;
    const over = !!e.target.closest('a, button, summary, .chips li');
    ts = over ? 1.9 : 1;
    cursor.classList.toggle('over', over);
    if (!raf) raf = requestAnimationFrame(tick);
    const r = welcome.getBoundingClientRect();
    if (e.clientY < r.bottom) {
      welcome.style.setProperty('--mx', e.clientX - r.left + 'px');
      welcome.style.setProperty('--my', e.clientY - r.top + 'px');
      welcome.style.setProperty('--glow', 1);
    } else welcome.style.setProperty('--glow', 0);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { cursor.classList.remove('on'); welcome.style.setProperty('--glow', 0); });
})();
