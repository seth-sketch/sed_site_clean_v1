/* project.js – fills a project page from work.json and
   wires up gallery thumbs. */

(async () => {
  function slugFromURL() {
    const m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  async function loadJSON() {
    const paths = ['../assets/work.json', '/assets/work.json', '../../assets/work.json'];
    for (const p of paths) {
      try {
        const r = await fetch(p, { cache: 'no-store' });
        if (r.ok) return r.json();
      } catch (_) {}
    }
    throw new Error('work.json not found');
  }

  try {
    const slug = slugFromURL();
    if (!slug) return;

    const list = await loadJSON();
    const item = list.find(x => x.slug === slug);
    if (!item) return;

    const titleEl = document.querySelector('[data-project="title"]') || document.querySelector('h1');
    const metaEl  = document.querySelector('[data-project="meta"]');
    const heroEl  = document.querySelector('[data-project="hero"]');
    const thumbsEl= document.querySelector('[data-project="thumbs"]');
    const nextEl  = document.querySelector('[data-project="next"]');
    const backEl  = document.querySelector('[data-project="back"]');

    if (titleEl) titleEl.textContent = item.title;
    if (metaEl)  metaEl.textContent  = `${item.client} · ${item.year} · ${item.role}`;

    if (heroEl) heroEl.innerHTML = `<span class="ratio-169"><img src="${item.cover}" alt=""></span>`;

    if (thumbsEl && Array.isArray(item.gallery) && item.gallery.length) {
      thumbsEl.innerHTML = item.gallery.map(src =>
        `<button class="thumb" data-src="${src}"><img loading="lazy" src="${src}" alt=""></button>`
      ).join('');
      thumbsEl.addEventListener('click', e => {
        const btn = e.target.closest('button.thumb');
        if (btn && heroEl) {
          heroEl.innerHTML = `<span class="ratio-169"><img src="${btn.dataset.src}" alt=""></span>`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    if (backEl) backEl.href = '../index.html#work';

    if (nextEl) {
      const i = list.findIndex(x => x.slug === slug);
      const nxt = list[(i + 1) % list.length];
      nextEl.href = `${nxt.slug}.html`;
      const label = nextEl.querySelector('span');
      if (label) label.textContent = nxt.title;
    }
  } catch (e) {
    console.error('Project page init failed:', e);
  }
})();<strong></strong>