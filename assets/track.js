// Visitor analytics, sent to GoatCounter (no cookies, no personal data).
// Dashboard: https://mohammadjranjbar.goatcounter.com
//
// GoatCounter counts page views on its own. This file adds events, which show in
// the dashboard as paths:
//   cv                      CV opened
//   email                   email link clicked
//   paper/<name>/<site>     paper link (arxiv, acl-anthology, ieee, ...)
//   dataset/<name>          Hugging Face dataset
//   model/<name>            Hugging Face model
//   code/<repo>             GitHub repository
//   profile/<site>          Google Scholar, GitHub, Hugging Face, LinkedIn, arXiv
//   download/<file>         other PDFs on this site
//   link/<host/path>        any other outside link
//   bibtex/<page>           BibTeX opened;  bibtex-copied/<page> when copied
//   play/<page>/<file>      an audio or video sample played
//   listened/<page>         played at least one sample (once per visit)
//   read-to-end/<page>      scrolled down to the footer
//   theme/dark, theme/light the theme switch
//   egg/<name>              an easter egg found (once per visitor)
// Each event's referrer is the page it happened on.
// Visit any page with #toggle-goatcounter to stop counting your own visits.
(() => {
  const page = location.pathname;
  const slug = page.replace(/\/+$/, '').split('/').pop() || 'home';

  // Events can happen before GoatCounter's script has loaded; hold them until it has.
  const queue = [], sent = new Set();
  let waiting = false;
  const ready = () => window.goatcounter && typeof window.goatcounter.count === 'function';
  function flush() { while (queue.length) window.goatcounter.count(queue.shift()); }
  function wait(tries) {
    if (ready()) { waiting = false; return flush(); }
    if (tries > 0) setTimeout(() => wait(tries - 1), 300);
    else { waiting = false; queue.length = 0; }  // blocked (e.g. by an ad blocker): drop quietly
  }
  function track(name, title, opts) {
    if (opts && opts.once) { if (sent.has(name)) return; sent.add(name); }
    queue.push({ path: name, title: title || name, event: true, referrer: page });
    if (ready()) flush();
    else if (!waiting) { waiting = true; wait(40); }
  }
  window.track = track;

  // Readable names for the papers' own pages.
  const PAPERS = {
    'arxiv.org/abs/2603.14456': 'PARSA-Bench',
    'arxiv.org/abs/2510.10774': 'ParsVoice',
    'arxiv.org/abs/2506.00250': 'PersianMedQA',
    'arxiv.org/abs/2603.05314': 'PersianPunc',
    'aclanthology.org/2026.emnlp-main.2458': 'ParsVoice',
    'aclanthology.org/2026.lrec-1.342': 'PersianMedQA',
    'aclanthology.org/2026.silkroadnlp-1.11': 'PersianPunc',
    'aclanthology.org/2026.silkroadnlp-1.9': 'SilkRoadNLP-1.9',
    'ieeexplore.ieee.org/document/10025253': 'Social-Robots',
  };
  const PAPER_SITES = { 'arxiv.org': 'arxiv', 'aclanthology.org': 'acl-anthology', 'ieeexplore.ieee.org': 'ieee', 'doi.org': 'doi', 'openreview.net': 'openreview' };
  const MY_SCHOLAR = 'xE5G7NIAAAAJ';

  function classify(a) {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('mailto:')) return ['email', 'Email link'];
    if (href.startsWith('#') || href.startsWith('javascript:')) return null;
    let u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname.replace(/\/+$/, '');
    const parts = path.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const text = (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

    if (u.origin === location.origin || host === 'mohammadjranjbar.github.io') {
      if (/^cv([-_][\w-]*)?\.pdf$/i.test(last)) return ['cv', 'CV (PDF)'];
      if (/\.(pdf|zip|bib|csv)$/i.test(last)) return ['download/' + last, 'Download: ' + last];
      return null;  // other pages on this site are counted as page views
    }
    if (host === 'huggingface.co') {
      if (parts[0] === 'datasets' && parts[2]) return ['dataset/' + parts[2], 'Dataset on Hugging Face: ' + parts[2]];
      if (parts[0] === 'spaces' && parts[2]) return ['demo/' + parts[2], 'Demo on Hugging Face: ' + parts[2]];
      if (parts.length >= 2) return ['model/' + parts[1], 'Model on Hugging Face: ' + parts[1]];
      return ['profile/huggingface', 'Hugging Face profile'];
    }
    if (host === 'github.com') {
      if (parts.length >= 2) return ['code/' + parts[1], 'GitHub: ' + parts.slice(0, 2).join('/')];
      if (parts[0] && parts[0].toLowerCase() === 'mohammadjranjbar') return ['profile/github', 'GitHub profile'];
    }
    if (/^scholar\.google\./.test(host)) {
      const user = u.searchParams.get('user') || '';
      if (user === MY_SCHOLAR) return ['profile/google-scholar', 'Google Scholar profile'];
      return ['link/scholar/' + user, 'Google Scholar: ' + (text || user)];
    }
    if (host.endsWith('linkedin.com')) return ['profile/linkedin', 'LinkedIn profile'];
    if (host === 'arxiv.org' && parts[0] === 'a') return ['profile/arxiv', 'arXiv author page'];
    if (PAPER_SITES[host]) {
      const name = PAPERS[host + path];
      return name
        ? ['paper/' + name + '/' + PAPER_SITES[host], 'Paper: ' + name + ' (' + PAPER_SITES[host] + ')']
        : ['paper/' + host + path, 'Paper: ' + host + path];
    }
    return ['link/' + host + path, 'Link: ' + (text ? text + ' (' + host + ')' : host + path)];
  }

  // Clicks and middle-clicks on links. Beacons survive leaving the page.
  function onLink(e) {
    if (e.type === 'auxclick' && e.button !== 1) return;
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const hit = classify(a);
    if (hit) track(hit[0], hit[1]);
  }
  document.addEventListener('click', onLink, true);
  document.addEventListener('auxclick', onLink, true);

  // Buttons: BibTeX, theme switch, audio play buttons, and a few page controls.
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button');
    if (!b) return;
    if (b.id === 'bibtexToggle') {
      // Count opening, not closing. The page's own handler runs after this one.
      setTimeout(() => { if (b.getAttribute('aria-expanded') === 'true' || /hide/i.test(b.textContent)) track('bibtex/' + slug, 'Opened BibTeX on ' + page); }, 0);
    } else if (b.id === 'themeToggle') {
      setTimeout(() => {
        const t = document.documentElement.dataset.theme;
        if (t === 'dark' || t === 'light') track('theme/' + t, 'Switched to the ' + t + ' theme');
      }, 0);
    } else if (b.dataset.src) {
      const file = b.dataset.src.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
      track('play/' + slug + '/' + file, 'Played ' + file + ' on ' + page, { once: true });
      track('listened/' + slug, 'Played a sample on ' + page, { once: true });
    } else if (b.id === 'loadMore') {
      track('more-samples/' + slug, 'Showed more samples on ' + page, { once: true });
    }
  }, true);

  // Someone copying the BibTeX is about to cite the paper.
  document.addEventListener('copy', e => {
    const box = e.target.closest ? e.target.closest('.bibtex') : null;
    const sel = String(document.getSelection ? document.getSelection() : '');
    if (box || /@(inproceedings|article|misc)\{/.test(sel)) track('bibtex-copied/' + slug, 'Copied BibTeX on ' + page, { once: true });
  });

  // Audio and video elements on the page (ParsVoice samples, the robot video).
  document.addEventListener('play', e => {
    const m = e.target;
    if (!(m instanceof HTMLMediaElement)) return;
    const src = m.currentSrc || m.getAttribute('src') || '';
    const file = decodeURIComponent(src.split('/').pop().split('?')[0]).replace(/\.[a-z0-9]+$/i, '') || 'media';
    track('play/' + slug + '/' + file, 'Played ' + file + ' on ' + page, { once: true });
    track('listened/' + slug, 'Played a sample on ' + page, { once: true });
  }, true);

  // The table view under the PARSA-Bench chart.
  document.addEventListener('toggle', e => {
    if (e.target.matches && e.target.matches('details.table-view') && e.target.open) track('table-view/' + slug, 'Opened the table view on ' + page, { once: true });
  }, true);

  // Read all the way down.
  const footer = document.querySelector('footer');
  if (footer && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(en => en.isIntersecting) && document.documentElement.scrollHeight > innerHeight * 1.3) {
        track('read-to-end/' + slug, 'Scrolled to the end of ' + page, { once: true });
        io.disconnect();
      }
    });
    io.observe(footer);
  }
})();
