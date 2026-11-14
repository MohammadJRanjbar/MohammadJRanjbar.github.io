// Theme toggle: follows system preference until the visitor picks one.
const toggle = document.getElementById('themeToggle');
function currentTheme() {
  const forced = document.documentElement.dataset.theme;
  if (forced) return forced;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function renderToggle() {
  if (toggle) toggle.textContent = currentTheme() === 'dark' ? '☀' : '☾';
}

// Shared audio state so only one thing plays at a time.
let playing = null;

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Gold string: a saffron line under the nav that runs edge to edge across the
// screen. Move the cursor across it to pluck it; it sings along with the voice demo.
const goldString = (() => {
  const nav = document.querySelector('nav');
  if (!nav) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'gold-string';
  canvas.setAttribute('aria-hidden', 'true');
  nav.appendChild(canvas);
  nav.classList.add('has-string');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, N = 0, dpr = 1, y, v;
  let voice = 0, voiceNow = 0, running = false, visible = true, prevDy = null;
  const t0 = performance.now();

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const n = Math.max(24, Math.round(W / 8));
    if (n !== N) { N = n; y = new Float32Array(N); v = new Float32Array(N); }
    draw(performance.now());
  }

  function pluck(xFrac, amp) {
    if (!N || reduceMotion) return;
    const c = xFrac * (N - 1), r = Math.max(3, N * 0.04);
    for (let i = 1; i < N - 1; i++) { const d = (i - c) / r; v[i] += amp * Math.exp(-d * d); }
    wake();
  }

  // 1-D wave equation with pinned ends and light damping.
  function step() {
    for (let k = 0; k < 2; k++) {
      for (let i = 1; i < N - 1; i++) v[i] += 0.45 * (y[i - 1] + y[i + 1] - 2 * y[i]) - 0.01 * v[i];
      for (let i = 1; i < N - 1; i++) y[i] = Math.max(-15, Math.min(15, y[i] + v[i]));
    }
  }

  function draw(now) {
    if (!W) return;
    const cs = getComputedStyle(document.documentElement);
    const gold = cs.getPropertyValue('--accent2').trim() || '#c08a2d';
    const dark = currentTheme() === 'dark';
    const t = (now - t0) / 1000, mid = H / 2, dx = W / (N - 1);
    voiceNow += (voice - voiceNow) * 0.25;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, gold);
    const s = reduceMotion ? -1 : ((t / 6) % 1.5) - 0.25;   // a sheen gliding across
    if (s > 0.06 && s < 0.94) {
      grad.addColorStop(s - 0.06, gold);
      grad.addColorStop(s, dark ? '#fff1c4' : '#f2c35e');
      grad.addColorStop(s + 0.06, gold);
    }
    grad.addColorStop(1, gold);

    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1), env = Math.sin(Math.PI * f);
      let yy = y[i];
      if (!reduceMotion) yy += 0.7 * env * Math.sin(f * 5 + t * 0.8);
      if (voiceNow > 0.01) yy += voiceNow * 8 * env * Math.sin(f * 46 - t * 24) * (0.55 + 0.45 * Math.sin(f * 7 + t * 3));
      if (i) ctx.lineTo(i * dx, mid + yy); else ctx.moveTo(0, mid + yy);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (dark) { ctx.shadowColor = gold; ctx.shadowBlur = 7; }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function frame(now) {
    if (!visible || reduceMotion) { running = false; return; }
    step(); draw(now);
    requestAnimationFrame(frame);
  }
  function wake() { if (!running && visible && !reduceMotion) { running = true; requestAnimationFrame(frame); } }

  // Crossing the line with the cursor plucks it, like a harp string.
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, dy = e.clientY - (r.top + r.height / 2);
    if (x < 0 || x > r.width || Math.abs(dy) > 60) { prevDy = null; return; }
    if (prevDy !== null && Math.sign(dy) !== Math.sign(prevDy)) {
      pluck(x / r.width, Math.max(-3.5, Math.min(3.5, (dy - prevDy) * 0.22)));
    }
    prevDy = dy;
  }, { passive: true });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }).observe(nav);
  addEventListener('resize', resize);
  resize();
  wake();
  return { pluck, setVoice(a) { voice = a; wake(); }, redraw() { draw(performance.now()); } };
})();

// Signature waveform: the real amplitude envelope of a cloned-voice sample.
const waveCanvas = document.getElementById('wave');
let drawWave = () => {};
if (waveCanvas && window.WAVEFORM) {
  const wf = window.WAVEFORM;
  const waveBtn = document.getElementById('waveBtn');
  const waveState = document.getElementById('waveState');
  const heroAudio = new Audio(waveBtn.dataset.src);
  heroAudio.preload = 'none';
  let waveProgress = 0;

  drawWave = function () {
    const dpr = window.devicePixelRatio || 1;
    const w = waveCanvas.clientWidth, h = waveCanvas.clientHeight;
    if (!w) return;
    waveCanvas.width = w * dpr;
    waveCanvas.height = h * dpr;
    const ctx = waveCanvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const cs = getComputedStyle(document.documentElement);
    const accent = cs.getPropertyValue('--accent').trim();
    const saffron = cs.getPropertyValue('--accent2').trim();
    const n = wf.length, bw = w / n;
    for (let i = 0; i < n; i++) {
      const bh = Math.max(wf[i], 0.04) * (h - 6);
      ctx.globalAlpha = (i / n <= waveProgress && waveProgress > 0) ? 1 : 0.4;
      ctx.fillStyle = accent;
      ctx.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
    }
    ctx.globalAlpha = 1;
    if (waveProgress > 0 && waveProgress < 1) {
      ctx.fillStyle = saffron;
      ctx.fillRect(w * waveProgress - 1, 2, 2, h - 4);
    }
  };

  // While the clone speaks, the gold string follows its loudness.
  function voiceLoop() {
    if (!goldString) return;
    if (heroAudio.paused || !heroAudio.duration) { goldString.setVoice(0); return; }
    const p = heroAudio.currentTime / heroAudio.duration;
    goldString.setVoice(wf[Math.min(wf.length - 1, Math.floor(p * wf.length))] || 0);
    requestAnimationFrame(voiceLoop);
  }

  function stopHero() {
    heroAudio.pause();
    heroAudio.currentTime = 0;
    waveProgress = 0;
    waveState.textContent = '▶ press to listen';
    if (goldString) goldString.setVoice(0);
    drawWave();
  }
  heroAudio.addEventListener('playing', voiceLoop);
  waveBtn.addEventListener('click', () => {
    if (playing && playing.audio !== heroAudio) playing.stop();
    if (heroAudio.paused) {
      heroAudio.play();
      waveState.textContent = '❚❚ playing';
      playing = { audio: heroAudio, stop: stopHero };
    } else {
      stopHero();
      playing = null;
    }
  });
  heroAudio.addEventListener('timeupdate', () => {
    if (heroAudio.duration) { waveProgress = heroAudio.currentTime / heroAudio.duration; drawWave(); }
  });
  heroAudio.addEventListener('ended', () => { stopHero(); playing = null; });
  window.addEventListener('resize', drawWave);
  drawWave();
}

if (toggle) {
  toggle.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
    renderToggle();
    drawWave();
    if (goldString) goldString.redraw();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { renderToggle(); drawWave(); });
  renderToggle();
}

// Minimal audio players for the voice-cloning samples.
document.querySelectorAll('.play-btn').forEach(btn => {
  const audio = new Audio(btn.dataset.src);
  audio.preload = 'none';
  const icon = btn.querySelector('.icon');
  const fill = btn.querySelector('.fill');
  btn.addEventListener('click', () => {
    if (playing && playing.audio !== audio) playing.stop();
    if (audio.paused) {
      audio.play();
      icon.textContent = '❚❚';
      playing = { audio, stop() { audio.pause(); audio.currentTime = 0; icon.textContent = '▶'; fill.style.width = '0%'; } };
    } else {
      playing.stop();
      playing = null;
    }
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });
  audio.addEventListener('ended', () => {
    icon.textContent = '▶';
    fill.style.width = '0%';
    audio.currentTime = 0;
    playing = null;
  });
});

// Gold thread: the line under the nav keeps going, down into the background of
// the page. It draws itself as you scroll and ends at a small brass key in the footer.
const goldThread = (() => {
  const page = document.querySelector('.page');
  const nav = document.querySelector('nav');
  if (!page || !nav) return null;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'gold-thread');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(NS, 'path');
  const bead = document.createElementNS(NS, 'circle');
  bead.setAttribute('r', '2.6');
  bead.setAttribute('class', 'bead');
  // Fainter behind the text column, brighter out in the margins.
  const mask = document.createElementNS(NS, 'mask');
  mask.id = 'thread-mask';
  mask.setAttribute('maskUnits', 'userSpaceOnUse');
  const mAll = document.createElementNS(NS, 'rect'), mCol = document.createElementNS(NS, 'rect');
  mAll.setAttribute('fill', '#fff');
  mCol.setAttribute('fill', '#555');
  mask.append(mAll, mCol);
  const defs = document.createElementNS(NS, 'defs');
  defs.append(mask);
  path.setAttribute('mask', 'url(#thread-mask)');
  svg.append(defs, path, bead);
  document.body.prepend(svg);

  let total = 0, table = [], endY = 0, startY = 0, ticking = false, onEnd = null, ended = false;

  function smooth(pts) {
    // Catmull-Rom through the anchors, as cubic Béziers.
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  }

  function build() {
    // Measure the page without the thread itself, or it could only ever grow.
    svg.style.height = '0px';
    svg.setAttribute('height', '0');
    const W = document.documentElement.clientWidth;
    const H = document.documentElement.scrollHeight;
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.height = H + 'px';
    const colLeft = page.getBoundingClientRect().left;
    for (const [k, v] of Object.entries({ x: 0, y: 0, width: W, height: H })) mAll.setAttribute(k, v);
    for (const [k, v] of Object.entries({ x: colLeft + 12, y: 0, width: Math.max(0, W - 2 * colLeft - 24), height: H })) mCol.setAttribute(k, v);
    const narrow = colLeft < 70;
    const xL = narrow ? W - 7 : Math.max(14, colLeft * 0.5);
    const xR = narrow ? W - 7 : W - Math.max(14, colLeft * 0.5);
    startY = nav.getBoundingClientRect().bottom + scrollY;
    const pts = [[W + 2, startY], [xR, startY + 70]];
    let lastY = startY + 70, side = 1;   // stay in the right margin past the masthead
    for (const el of page.children) {
      if (el.tagName === 'FOOTER' || el.classList.contains('room')) continue;
      const top = el.getBoundingClientRect().top + scrollY;
      if (el.offsetHeight && top - lastY > 240) { pts.push([side ? xR : xL, top + 30]); side ^= 1; lastY = top + 30; }
    }
    const key = document.querySelector('.key-egg');
    const kr = key ? key.getBoundingClientRect() : page.getBoundingClientRect();
    const kx = kr.left + kr.width / 2, ky = (key ? kr.top + kr.height / 2 : kr.bottom) + scrollY;
    pts.push([narrow ? xR : kx + 40, ky - 60], [kx, ky]);
    path.setAttribute('d', smooth(pts));
    total = path.getTotalLength();
    table = [];
    for (let i = 0; i <= 240; i++) { const L = total * i / 240; table.push([L, path.getPointAtLength(L).y]); }
    endY = ky;
    path.style.strokeDasharray = total;
    update();
  }

  function lengthAtY(y) {
    let best = 0;
    for (const [L, py] of table) { if (py <= y) best = L; else break; }
    return best;
  }

  function update() {
    ticking = false;
    if (!total) return;
    const reach = reduceMotion ? Infinity : scrollY + innerHeight * 0.88;
    const L = reach >= endY ? total : lengthAtY(reach);
    path.style.strokeDashoffset = total - L;
    const p = path.getPointAtLength(L);
    bead.setAttribute('cx', p.x);
    bead.setAttribute('cy', p.y);
    bead.style.opacity = L > 4 && L < total - 1 ? 1 : 0;
    if (L >= total - 1 && !ended) { ended = true; if (onEnd) onEnd(); }
    if (L < total - 1) ended = false;
  }

  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  let rt;
  const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 120); };
  addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(page);
  addEventListener('load', build);
  return { build, set onEnd(fn) { onEnd = fn; } };
})();

// Nudges: small, unexplained signs of life that invite a click. Flip any of these off.
const NUDGES = {
  tease: true,      // once per visit, ~8s in, the portrait flickers into another version and back
  hover: true,      // the portrait jiggles and the names flicker when the cursor reaches them
  keyWiggle: true,  // the brass key wiggles when the gold thread reaches it
  counter: true,    // after the first find, a quiet "✦ 1 of 5" appears in the footer
};

// Remembers which easter eggs this visitor has found, and shows the quiet counter.
// Visit any page with ?reset-eggs to start over.
const eggs = (() => {
  const ALL = ['portal', 'names', 'photos', 'stretch', 'drawer'];
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  if (/[?&]reset-eggs\b/.test(location.search)) {
    try { localStorage.removeItem('eggs-found'); sessionStorage.removeItem('eggs-teased'); } catch (e) {}
  }
  let found = [];
  try { found = JSON.parse(store.get('eggs-found') || '[]').filter(x => ALL.includes(x)); } catch (e) {}
  let el = null;
  function render(bump) {
    if (!NUDGES.counter || !found.length) return;
    const footer = document.querySelector('.page footer');
    if (!footer) return;
    if (!el) {
      el = document.createElement('span');
      el.className = 'egg-count';
      el.title = 'secrets found';
      const key = footer.querySelector('.key-egg');
      footer.insertBefore(el, key);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    }
    el.textContent = `✦ ${found.length} of ${ALL.length}`;
    el.classList.toggle('all', found.length === ALL.length);
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  }
  return {
    found(id) {
      if (!ALL.includes(id) || found.includes(id)) return;
      found.push(id);
      store.set('eggs-found', JSON.stringify(found));
      render(true);
    },
    render,
  };
})();

// Small shared toast for the easter eggs.
function eggToast(html) {
  const t = document.createElement('div');
  t.className = 'egg-toast';
  t.setAttribute('role', 'status');
  t.innerHTML = html;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2400);
}

// Easter egg: a brass key at the end of the thread. It unlocks a desk drawer:
// a sealed letter, and a couple of gold coins someone tucked away.
(() => {
  const footer = document.querySelector('.page footer');
  if (!footer) return;
  const key = document.createElement('button');
  key.className = 'key-egg';
  key.type = 'button';
  key.setAttribute('aria-label', 'A small brass key');
  key.setAttribute('aria-expanded', 'false');
  key.innerHTML = '<svg viewBox="0 0 24 12" width="22" height="11" aria-hidden="true"><circle cx="5" cy="6" r="3.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="6" r="1.1" fill="currentColor"/><path d="M8.6 6H22.5M18.5 6v3.2M21.5 6v2.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
  footer.appendChild(key);

  const bee = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><ellipse cx="6.6" cy="7" rx="3.4" ry="2.3" transform="rotate(-30 6.6 7)" fill="currentColor" opacity=".55"/><ellipse cx="13.4" cy="7" rx="3.4" ry="2.3" transform="rotate(30 13.4 7)" fill="currentColor" opacity=".55"/><ellipse cx="10" cy="12" rx="3.2" ry="4.6" fill="currentColor"/><path d="M7 11h6M7.2 13.4h5.6" stroke="#e2b55a" stroke-width="1.1"/></svg>';
  const coin = () => '<button class="coin" type="button" aria-label="A gold coin. Flip it."><span class="coin-inner"><span class="face heads" lang="fa">شیر</span><span class="face tails" lang="fa">خط</span></span></button>';

  const room = document.createElement('div');
  room.className = 'room';
  room.id = 'hidden-drawer';
  room.innerHTML = `
    <div class="room-inner">
      <div class="drawer">
        <span class="drawer-pull" aria-hidden="true"></span>
        <div class="drawer-bed">
          <div class="env-wrap">
            <button class="envelope" type="button" aria-label="A sealed letter. Open it." aria-expanded="false">
              <span class="env-body"></span>
              <span class="env-front"></span>
              <span class="env-flap"></span>
              <span class="seal">${bee}</span>
            </button>
            <div class="letter" hidden>
              <p>Dear reader,</p>
              <p>You found the drawer, which means you read all the way to the bottom. Thank you.</p>
              <p>A life can be large in a small room. Mine is mostly a desk, a window, and a few good
                 questions. If one of them is yours too, <a href="mailto:mohammad.ranjbar@epfl.ch">write to me</a>.</p>
              <p class="sign">M. J. R.</p>
            </div>
          </div>
          <div class="coins">${coin()}${coin()}</div>
        </div>
      </div>
    </div>`;
  key.setAttribute('aria-controls', room.id);
  footer.after(room);

  key.addEventListener('click', () => {
    const open = room.classList.toggle('open');
    if (open) eggs.found('drawer');
    key.classList.toggle('turned', open);
    key.setAttribute('aria-expanded', String(open));
    if (open) setTimeout(() => room.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }), 300);
  });

  const env = room.querySelector('.envelope'), letter = room.querySelector('.letter');
  env.addEventListener('click', () => {
    env.classList.add('open');
    env.setAttribute('aria-expanded', 'true');
    setTimeout(() => {
      env.hidden = true;
      letter.hidden = false;
      setTimeout(() => room.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' }), 60);
    }, reduceMotion ? 0 : 520);
  });

  // Heads or tails: شیر یا خط.
  room.querySelectorAll('.coin').forEach(c => {
    const inner = c.querySelector('.coin-inner');
    let turn = 0;
    c.addEventListener('click', () => {
      const from = turn;
      turn += 360 * (3 + Math.floor(Math.random() * 2)) + (Math.random() < 0.5 ? 180 : 0);
      if (reduceMotion) { inner.style.transform = `rotateY(${turn}deg)`; return; }
      inner.animate([
        { transform: `translateY(0) rotateY(${from}deg)` },
        { transform: `translateY(-30px) rotateY(${(from + turn) / 2}deg)`, offset: 0.45 },
        { transform: `translateY(0) rotateY(${turn}deg)` }
      ], { duration: 950, easing: 'cubic-bezier(.25,.8,.3,1)', fill: 'forwards' });
    });
  });

  if (goldThread) {
    goldThread.build();
    if (NUDGES.keyWiggle) goldThread.onEnd = () => { key.classList.remove('glint'); void key.offsetWidth; key.classList.add('glint'); };
  }
})();

// Easter egg: click the English name and the portrait jumps to another version of
// itself (photo, comic, cartoon), with the same printed-comic glitch as the Persian name.
(() => {
  const h1 = document.querySelector('.masthead h1');
  const img = document.querySelector('.portrait');
  if (!h1 || !img) return;
  const versions = [
    { src: img.getAttribute('src'), alt: img.alt },
    { src: '/images/profile-comic.jpg', alt: 'Comic-style portrait of Mohammad Javad Ranjbar' },
    { src: '/images/profile-cartoon.jpg', alt: 'Cartoon portrait of Mohammad Javad Ranjbar' },
  ];
  let i = 0, busy = false, preloaded = false, clicked = false;
  const preload = () => { if (preloaded) return; preloaded = true; versions.slice(1).forEach(v => { const im = new Image(); im.src = v.src; }); };
  const ready = async src => { try { const p = new Image(); p.src = src; await Promise.race([p.decode(), new Promise(r => setTimeout(r, 400))]); } catch (e) {} };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  h1.addEventListener('pointerenter', preload, { once: true });

  // Channel split, done with an SVG filter so it works on a photo.
  const NS = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(NS, 'svg');
  defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.position = 'absolute';
  defs.innerHTML = `<filter id="verse-split" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
    <feOffset in="r" dx="0" result="ro"/>
    <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb"/>
    <feOffset in="gb" dx="0" result="gbo"/>
    <feBlend in="ro" in2="gbo" mode="screen"/></filter>`;
  document.body.appendChild(defs);
  const [offR, offGB] = defs.querySelectorAll('feOffset');
  const dots = 'radial-gradient(circle, #000 1.5px, transparent 1.9px) 0 0 / 4.5px 4.5px';

  function frame(f) {
    offR.setAttribute('dx', f.s || 0);
    offGB.setAttribute('dx', -(f.s || 0));
    img.style.filter = f.s ? 'url(#verse-split)' : '';
    img.style.transform = f.x ? `translateX(${f.x}px)` : '';
    img.style.clipPath = f.clip || '';
    img.style.webkitMask = img.style.mask = f.dots ? dots : '';
    if (f.to) { img.src = f.to.src; img.alt = f.to.alt; }
  }
  // Stepped frames, held a beat each, like animation drawn on twos.
  async function play(seq, nameClass) {
    h1.classList.add(nameClass);
    for (const f of seq) { frame(f); await wait(62); }
    h1.classList.remove(nameClass);
  }

  h1.classList.add('verse');
  h1.addEventListener('click', async () => {
    if (busy || img.style.visibility === 'hidden') return;
    busy = true; clicked = true;
    preload();
    eggs.found('photos');
    i = (i + 1) % versions.length;
    const v = versions[i];
    if (reduceMotion) { frame({ to: v }); busy = false; return; }
    await ready(v.src);
    await play([
      { s: 6, x: -3 }, { s: -5, x: 4, clip: 'inset(0 0 46% 0)' }, { s: 4, x: -2, clip: 'inset(38% 0 0 0)' },
      { s: 0, dots: true, to: v }, { s: -4, x: 2, dots: true }, { s: 3, x: -1 }, { s: 1 }, {}
    ], 'glitching');
    busy = false;
  });

  // Nudge: once per visit, a few seconds in, the portrait slips into another
  // version for a blink and comes straight back. No explanation.
  if (NUDGES.tease && !reduceMotion) {
    let teased = false;
    try { teased = sessionStorage.getItem('eggs-teased') === '1'; } catch (e) {}
    const tease = async () => {
      if (busy || clicked || i !== 0 || scrollY > 260 || img.style.visibility === 'hidden') return;
      busy = true;
      try { sessionStorage.setItem('eggs-teased', '1'); } catch (e) {}
      preload();
      await ready(versions[1].src);
      await play([
        { s: 5, x: -2 }, { s: -4, x: 3, dots: true, to: versions[1] }, { s: 3, x: -1, dots: true },
        { s: -2, x: 1, clip: 'inset(30% 0 0 0)', to: versions[0] }, {}
      ], 'flicker');
      busy = false;
    };
    const arm = () => setTimeout(() => {
      if (document.hidden) document.addEventListener('visibilitychange', arm, { once: true });
      else tease();
    }, 8000);
    if (!teased) arm();
  }
})();

// Nudge: things react when the cursor finds them. The portrait gives a little
// jiggle (it's squishy), the names flicker for a single frame.
(() => {
  if (!NUDGES.hover || reduceMotion) return;
  const img = document.querySelector('.portrait');
  let lastJiggle = 0;
  if (img) img.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse' || e.buttons || img.style.transform || img.style.visibility === 'hidden') return;
    const now = performance.now();
    if (now - lastJiggle < 2500) return;
    lastJiggle = now;
    img.animate([
      { transform: 'none' }, { transform: 'scale(1.05, 0.95)' }, { transform: 'scale(0.97, 1.03)' },
      { transform: 'scale(1.015, 0.985)' }, { transform: 'none' }
    ], { duration: 460, easing: 'ease-out' });
  });
  document.querySelectorAll('.masthead h1, .name-fa').forEach(el => {
    let last = 0;
    el.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse' || el.classList.contains('glitching') || el.classList.contains('flicker')) return;
      const now = performance.now();
      if (now - last < 1200) return;
      last = now;
      el.classList.add('flicker');
      setTimeout(() => el.classList.remove('flicker'), 170);
    });
  });
})();

// Easter egg: grab the portrait and pull. It stretches like taffy and snaps back.
(() => {
  const img = document.querySelector('.portrait');
  if (!img || reduceMotion) return;
  img.classList.add('stretchy');
  img.draggable = false;
  let grab = null, x = 0, y = 0, vx = 0, vy = 0, springing = false, springId = 0, maxPull = 0;

  function render() {
    const len = Math.hypot(x, y);
    if (len < 0.3) { img.style.transform = ''; return; }
    const ang = Math.atan2(y, x) * 180 / Math.PI;
    const s = 1 + Math.min(len, 260) / 150, q = 1 / Math.sqrt(s);
    img.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px) rotate(${ang}deg) scale(${s}, ${q}) rotate(${-ang}deg)`;
  }
  function spring() {
    springing = true;
    const id = ++springId;
    let last = performance.now();
    (function tick(now) {
      if (id !== springId) return;
      const dt = Math.min(0.032, (now - last) / 1000); last = now;
      vx += (-260 * x - 9 * vx) * dt; vy += (-260 * y - 9 * vy) * dt;
      x += vx * dt; y += vy * dt;
      render();
      if (Math.hypot(x, y) > 0.3 || Math.hypot(vx, vy) > 2) requestAnimationFrame(tick);
      else { x = y = vx = vy = 0; render(); springing = false; }
    })(last);
  }

  img.addEventListener('pointerdown', e => {
    if (img.style.visibility === 'hidden') return;
    springId++; springing = false;
    grab = { x: e.clientX - x * 1.6, y: e.clientY - y * 1.6, id: e.pointerId, moved: false };
    maxPull = 0;
    img.setPointerCapture(e.pointerId);
  });
  img.addEventListener('pointermove', e => {
    if (!grab || e.pointerId !== grab.id) return;
    const dx = e.clientX - grab.x, dy = e.clientY - grab.y;
    if (!grab.moved && Math.hypot(dx, dy) < 5) return;
    grab.moved = true;
    img.dataset.dragged = '1';
    // Resistance grows the further you pull.
    const len = Math.hypot(dx, dy), k = 260 * (1 - Math.exp(-len / 260)) / (len || 1);
    x = dx * k; y = dy * k; vx = vy = 0;
    maxPull = Math.max(maxPull, Math.hypot(x, y));
    if (!springing) render();
  });
  const release = e => {
    if (!grab || e.pointerId !== grab.id) return;
    const moved = grab.moved;
    grab = null;
    if (!moved) return;
    spring();
    if (maxPull > 60) eggs.found('stretch');
    if (maxPull > 150) setTimeout(() => eggToast('✦ mathematical!'), 280);
    setTimeout(() => { delete img.dataset.dragged; }, 0);
  };
  img.addEventListener('pointerup', release);
  img.addEventListener('pointercancel', release);
})();

// Easter egg: click the Persian name and it jumps to another version of itself:
// the same name in another script, with a printed-comic glitch on the way.
(() => {
  const el = document.querySelector('.name-fa');
  if (!el) return;
  const versions = [
    { t: el.textContent.trim(), lang: 'fa', dir: 'rtl', name: 'Persian' },
    { t: 'Мохаммад Джавад Ранджбар', lang: 'ru', dir: 'ltr', name: 'Russian' },
    { t: 'मोहम्मद जवाद रंजबर', lang: 'hi', dir: 'ltr', name: 'Hindi' },
    { t: 'モハンマド・ジャヴァード・ランジバル', lang: 'ja', dir: 'ltr', name: 'Japanese' },
    { t: 'Μοχάμαντ Τζαβάντ Ραντζμπάρ', lang: 'el', dir: 'ltr', name: 'Greek' },
    { t: '모하마드 자바드 란지바르', lang: 'ko', dir: 'ltr', name: 'Korean' },
    { t: 'Մոհամմադ Ջավադ Ռանջբար', lang: 'hy', dir: 'ltr', name: 'Armenian' },
    { t: 'מוחמד ג׳וואד רנג׳באר', lang: 'he', dir: 'rtl', name: 'Hebrew' },
    { t: '穆罕默德·贾瓦德·兰杰巴尔', lang: 'zh', dir: 'ltr', name: 'Chinese' },
  ];
  let i = 0, busy = false;
  el.classList.add('verse');
  el.style.textAlign = 'right';
  el.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    eggs.found('names');
    i = (i + 1) % versions.length;
    const v = versions[i];
    const swap = () => { el.textContent = v.t; el.lang = v.lang; el.dir = v.dir; el.title = v.name; };
    if (reduceMotion) { swap(); busy = false; return; }
    el.classList.add('glitching');
    setTimeout(swap, 170);
    setTimeout(() => { el.classList.remove('glitching'); busy = false; }, 420);
  });
})();

// Easter egg: type "portal" anywhere on the homepage (or triple-tap the portrait).
// Two portals open, firuzeh and saffron. The portrait drops into one, comes out
// of the other, keeps its momentum for a couple of loops, and lands.
(() => {
  const target = document.querySelector('.portrait');
  if (!target) return;
  const NS = 'http://www.w3.org/2000/svg';
  let busy = false, typed = '', taps = 0, tapTimer;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || !e.key || e.key.length !== 1) return;
    if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed === 'portal') { typed = ''; run(); }
  });
  target.addEventListener('click', () => {
    if (target.dataset.dragged) return;   // a stretch, not a tap
    taps++; clearTimeout(tapTimer); tapTimer = setTimeout(() => { taps = 0; }, 600);
    if (taps >= 3) { taps = 0; run(); }
  });
  console.log('%c✦ psst — type "portal" on the homepage', 'color:#c08a2d;font-weight:600');

  // Each portal is two layers. The hole and its far rim sit behind the falling
  // portrait; the near rim sits in front of it. That is what makes it go *in*.
  function makePortal(kind, cx, cy, a) {
    const b = a * 0.3, pad = Math.round(a * 0.7) + 20;
    const W = 2 * (a + pad), H = 2 * (b + pad);
    const id = 'p' + Math.random().toString(36).slice(2, 8);
    const glow = `<filter id="${id}g" x="-30%" y="-120%" width="160%" height="340%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    const layer = (cls, z, inner) => {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('class', `portal-layer ${kind} ${cls}`);
      s.setAttribute('aria-hidden', 'true');
      s.setAttribute('width', W);
      s.setAttribute('height', H);
      s.setAttribute('viewBox', `${-a - pad} ${-b - pad} ${W} ${H}`);
      Object.assign(s.style, { left: cx - a - pad + 'px', top: cy - b - pad + 'px', zIndex: z });
      s.innerHTML = inner;
      document.body.appendChild(s);
      return s;
    };
    const near = kind === 'in' ? 0 : 1;   // arc sweep: lower half for the floor, upper for the ceiling
    const back = layer('back', 997, `
      <defs>${glow}
        <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
        <radialGradient id="${id}h"><stop offset="0" stop-color="#000"/><stop offset=".62" stop-color="#04080a"/><stop offset="1" stop-color="currentColor" stop-opacity=".7"/></radialGradient>
      </defs>
      <ellipse class="pool" rx="${a * 1.5}" ry="${b * 2.4}" fill="currentColor" filter="url(#${id}b)"/>
      <ellipse rx="${a}" ry="${b}" fill="url(#${id}h)"/>
      <ellipse class="swirl s1" rx="${a * 0.74}" ry="${b * 0.64}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="16 20"/>
      <ellipse class="swirl s2" rx="${a * 0.48}" ry="${b * 0.4}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="7 11"/>
      <path d="M ${-a} 0 A ${a} ${b} 0 0 ${1 - near} ${a} 0" fill="none" stroke="currentColor" stroke-width="3" filter="url(#${id}g)"/>
      <ellipse class="flash" rx="${a}" ry="${b}" fill="none" stroke="currentColor" stroke-width="2"/>`);
    const front = layer('front', 1000, `<defs>${glow}</defs>
      <path d="M ${-a} 0 A ${a} ${b} 0 0 ${near} ${a} 0" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" filter="url(#${id}g)"/>`);
    requestAnimationFrame(() => requestAnimationFrame(() => { back.classList.add('open'); front.classList.add('open'); }));
    return { cx, cy, a, b, kind, layers: [back, front], color: css(kind === 'in' ? '--accent' : '--accent2') };
  }
  function closePortal(p) {
    p.layers.forEach(l => { l.classList.remove('open'); l.classList.add('closing'); setTimeout(() => l.remove(), 420); });
  }

  // The near rim, as y for a given x.
  function rimY(P, x) {
    const u = (x - P.cx) / P.a, k = Math.abs(u) >= 1 ? 0 : Math.sqrt(1 - u * u);
    return P.kind === 'in' ? P.cy + P.b * k : P.cy - P.b * k;
  }
  // Clip the portrait (in its own coordinates) so only the part on our side of the rim shows.
  function clipAt(P, gx, gy, gw, gh) {
    const pts = [];
    for (let s = 0; s <= 20; s++) {
      const lx = -24 + (gw + 48) * s / 20;
      pts.push(`${lx.toFixed(1)}px ${(rimY(P, gx + lx) - gy).toFixed(1)}px`);
    }
    if (P.kind === 'in') return `polygon(-24px -3000px, ${gw + 24}px -3000px, ${pts.reverse().join(', ')})`;
    return `polygon(${pts.join(', ')}, ${gw + 24}px ${gh + 3000}px, -24px ${gh + 3000}px)`;
  }

  function sparks(P, dir) {
    for (let k = 0; k < 14; k++) {
      const s = document.createElement('i');
      s.className = 'spark';
      const t = Math.random() * Math.PI * 2;
      Object.assign(s.style, { left: P.cx + Math.cos(t) * P.a * 0.95 + 'px', top: P.cy + Math.sin(t) * P.b * 0.95 + 'px', background: P.color, boxShadow: `0 0 6px ${P.color}` });
      document.body.appendChild(s);
      const dx = Math.cos(t) * (14 + Math.random() * 34), dy = dir * (16 + Math.random() * 46);
      s.animate([
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.2)`, opacity: 0 }
      ], { duration: 420 + Math.random() * 380, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove();
    }
  }

  function toast() {
    const t = document.createElement('div');
    t.className = 'egg-toast';
    t.setAttribute('role', 'status');
    t.innerHTML = '✦ momentum conserved · <span lang="fa" dir="rtl">دروازه</span>';
    document.body.appendChild(t);
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2600);
  }

  async function run() {
    if (busy) return;
    busy = true;
    eggs.found('portal');
    if (scrollY > 0) { scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); await wait(reduceMotion ? 50 : 500); }

    const r = target.getBoundingClientRect();
    const gw = r.width, gh = r.height, cx = r.left + gw / 2;
    const a = Math.max(70, gw * 0.8);
    const pin = makePortal('in', cx, r.bottom + a * 0.3 * 0.25, a);
    await wait(380);
    const pout = makePortal('out', cx, a * 0.3 + 10, a);
    await wait(320);

    // Move a stand-in so the real portrait keeps its place in the layout.
    const ghost = target.cloneNode(true);
    Object.assign(ghost.style, {
      position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: gw + 'px', height: gh + 'px',
      margin: '0', zIndex: '998', pointerEvents: 'none', willChange: 'top, clip-path'
    });
    document.body.appendChild(ghost);
    target.style.visibility = 'hidden';

    if (reduceMotion) {
      ghost.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 1200 });
      await wait(1200);
    } else {
      const line = document.querySelector('.gold-string');
      const lineY = line ? line.getBoundingClientRect().top + line.clientHeight / 2 : -1;
      const g = 1500, vMax = 1000;
      let top = r.top, vel = -240, teleports = 0, landing = false, bounces = 0, last = performance.now();
      let prevBottom = top + gh, inSparked = false, outSparked = false;
      await new Promise(done => {
        function tick(now) {
          const dt = Math.min(0.033, (now - last) / 1000); last = now;
          vel = Math.min(vMax, vel + g * dt);
          top += vel * dt;

          if (!landing && top >= pin.cy + pin.b) {
            // All the way through the firuzeh portal: out of the saffron one, same speed.
            top = top - (pin.cy + pin.b) + (pout.cy - pout.b - gh);
            teleports++; inSparked = false; outSparked = false;
            if (teleports >= 2) { landing = true; closePortal(pin); }
          }
          if (landing && top >= r.top) {
            top = r.top;
            if (bounces < 2 && vel > 200) {
              vel = -vel * 0.28; bounces++;
              ghost.animate([{ transform: 'scale(1.07, 0.9)', transformOrigin: '50% 100%' },
                { transform: 'none', transformOrigin: '50% 100%' }], { duration: 220, easing: 'ease-out' });
            } else {
              Object.assign(ghost.style, { top: top + 'px', clipPath: 'none', filter: 'none' });
              return done();
            }
          }

          const bottom = top + gh;
          let clip = 'none', glow = null;
          if (!landing && bottom > pin.cy - pin.b) { clip = clipAt(pin, r.left, top, gw, gh); glow = pin.color; }
          else if (top < pout.cy + pout.b) { clip = clipAt(pout, r.left, top, gw, gh); glow = pout.color; }
          ghost.style.top = top + 'px';
          ghost.style.clipPath = clip;
          ghost.style.filter = glow ? `drop-shadow(0 0 9px ${glow}) brightness(1.08)` : 'none';

          if (!landing && !inSparked && bottom > pin.cy) { inSparked = true; sparks(pin, -1); }
          if (!outSparked && bottom > pout.cy + pout.b && top < pout.cy + pout.b) { outSparked = true; sparks(pout, 1); }
          if (goldString && lineY > 0 && prevBottom < lineY && bottom >= lineY) goldString.pluck(cx / innerWidth, 3.2);
          prevBottom = bottom;
          requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }

    target.style.visibility = '';
    ghost.remove();
    if (pin.layers[0].isConnected && !pin.layers[0].classList.contains('closing')) closePortal(pin);
    closePortal(pout);
    toast();
    await wait(700);
    busy = false;
  }
})();

eggs.render();
