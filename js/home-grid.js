/* js/home-grid.js */
(function () {
  const grid = document.getElementById('grid');
  const scroller = document.getElementById('workScroller');
  if (!grid || !scroller) return;

  // 1) Try inline JSON first
  function getInlineItems() {
    const el = document.getElementById('seWorkJSON');
    if (!el) return null;
    try { return JSON.parse(el.textContent || '[]'); } catch { return null; }
  }

  // 2) Otherwise fetch assets/work.json
  async function getItems() {
    const inline = getInlineItems();
    if (inline && inline.length) return inline;

    try {
      const res = await fetch('assets/work.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('work.json not found');
      return await res.json();
    } catch {
      // Minimal fallback so the grid still renders
      return Array.from({ length: 12 }).map((_, i) => ({
        slug: `project-${i + 1}`,
        title: `Project ${i + 1}`,
        org: 'ABC News',
        year: 2024 + (i % 2),
        role: 'Production Designer',
        img: `assets/thumbs/thumb${(i % 6) + 1}.jpg`
      }));
    }
  }

  const card = (it) => {
    const href = it.slug ? `work/index.html?slug=${encodeURIComponent(it.slug)}` : '#';
    const img = it.img || (it.images && it.images[0]) || '';
    const meta = [it.org, it.year, it.role].filter(Boolean).join(' · ');
    return `
      <article class="card">
        <a class="cover" href="${href}">
          <div class="ratio-169">
            <img src="${img}" alt="${it.title || ''}">
          </div>
        </a>
        <div class="footer">
          <a href="${href}">${it.title || 'Untitled'}</a>
          <div class="meta">${meta}</div>
        </div>
      </article>`;
  };

  function renderInfinite(items) {
    let rendered = 0;
    const chunk = 12;

    function add(n) {
      const slice = items.slice(rendered, rendered + n);
      if (!slice.length) return;
      grid.insertAdjacentHTML('beforeend', slice.map(card).join(''));
      rendered += slice.length;
    }

    add(chunk);

    scroller.addEventListener('scroll', () => {
      const nearBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80;
      if (nearBottom) add(6);
    });
  }

  (async function init() {
    const items = await getItems();
    renderInfinite(items);
  })();
})();