/* Infinite Scroll Grid – robust
   - Finds grid: #homeGrid, #grid, or #workGrid
   - Uses the nearest .scroller as the observer root
   - Keeps loading until the scroller is at least one viewport tall
*/
(function () {
  const PAGE = 12;

  const grid =
    document.getElementById('homeGrid') ||
    document.getElementById('grid') ||
    document.getElementById('workGrid');

  if (!grid) { console.warn('[grid] no container'); return; }

  // Find the scrolling container
  const scroller = grid.closest('.scroller');
  if (!scroller) { console.warn('[grid] no .scroller ancestor'); return; }

  let items = [];
  let cursor = 0;
  let loading = false;
  let done = false;

  function esc(s){ return String(s || ''); }

  function card(p){
    const title = esc(p.title || 'Untitled Project');
    const meta  = [p.client, p.year, p.role].filter(Boolean).map(esc).join(' · ');
    const img   = esc(p.cover || (p.gallery && p.gallery[0]) || 'assets/work/placeholder-16x9.jpg');

    // One project template:
    const href = p.slug
      ? 'project.html?slug=' + encodeURIComponent(p.slug)
      : (p.href ? esc(p.href) : '#');

    return `
      <article class="card">
        <a class="cover" href="${href}">
          <span class="ratio-169"><img loading="lazy" src="${img}" alt=""></span>
        </a>
        <div class="footer">
          <a href="${href}">${title}</a>
          <div class="meta">${meta}</div>
        </div>
      </article>
    `;
  }

  // Ensure we have a sentinel INSIDE the scroller
  let sentinel = scroller.querySelector('#gridSentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.cssText = 'height:2px;width:100%';
    scroller.appendChild(sentinel);
  }

  function loadMore() {
    if (loading || done || !items.length) return;
    loading = true;

    const end = Math.min(cursor + PAGE, items.length);
    if (cursor >= end) {
      done = true;
      observer.disconnect();
      return (loading = false);
    }

    grid.insertAdjacentHTML(
      'beforeend',
      items.slice(cursor, end).map(card).join('')
    );
    cursor = end;
    loading = false;

    // If scroller isn’t filled yet, keep loading until it is (or we run out)
    if (scroller.scrollHeight <= scroller.clientHeight && !done) {
      loadMore();
    }
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some(e => e.isIntersecting)) loadMore();
  }, {
    root: scroller,          // KEY: observe inside the scroller
    rootMargin: '300px 0px',
    threshold: 0.01
  });

  // Load data with cache-buster
  fetch('assets/work.json?v=' + Date.now(), { cache: 'no-store' })
    .then(r => r.ok ? r.json() : [])
    .then(list => {
      items = Array.isArray(list) ? list : (list.projects || []);
      if (!items.length) {
        // placeholders so layout stays informative
        items = Array.from({ length: 24 }, (_, n) => ({
          slug: 'placeholder-' + (n+1),
          title: 'Project ' + (n+1),
          client: 'ABC News',
          year: '—',
          role: 'Production Designer',
          cover: 'assets/work/placeholder-16x9.jpg',
          href: '#'
        }));
      }
      // First render + observe
      loadMore();
      observer.observe(sentinel);
    })
    .catch(err => console.error('[grid] failed to load work.json', err));
})();