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

  function stopHero() {
    heroAudio.pause();
    heroAudio.currentTime = 0;
    waveProgress = 0;
    waveState.textContent = '▶ press to listen';
    drawWave();
  }
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
