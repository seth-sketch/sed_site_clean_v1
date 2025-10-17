/* Infinite Scroll Grid (robust) */
(function(){
  const BATCH = 12;

  const grid =
    document.getElementById('homeGrid') ||
    document.getElementById('grid') ||
    document.getElementById('workGrid');
  if (!grid) return;

  // find nearest .scroller (or window)
  function findScroller(el){
    let n = el;
    while (n && n !== document.body){
      if (n.classList && n.classList.contains('scroller')) return n;
      n = n.parentNode;
    }
    return null;
  }
  const scroller = findScroller(grid);

  // candidates for work.json (handles accidental nested assets/)
  const CANDIDATES = [
    'assets/work.json',
    './assets/work.json',
    '/assets/work.json'
  ];

  async function loadWork(){
    for (const u of CANDIDATES){
      try {
        const r = await fetch(u + '?v=' + Date.now(), { cache: 'no-store' });
        if (r.ok) return await r.json();
      } catch(e){}
    }
    return [];
  }

  function esc(s){ return String(s || ''); }
  function card(p){
    const title = esc(p.title || 'Untitled Project');
    const meta  = [p.client, p.year, p.role].filter(Boolean).map(esc).join(' · ');
    const img   = esc(p.cover || (Array.isArray(p.gallery) && p.gallery[0]) || 'assets/work/placeholder-16x9.jpg');
    const href  = p.slug ? ('project.html?slug=' + encodeURIComponent(p.slug)) : '#';

    return `
      <article class="card">
        <a class="cover" href="${href}">
          <span class="ratio-169"><img loading="lazy" src="${img}" alt=""></span>
        </a>
        <div class="footer">
          <a href="${href}">${title}</a>
          <div class="meta">${meta}</div>
        </div>
      </article>`;
  }

  // create a sentinel if missing
  let sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    (grid.parentNode || document.body).appendChild(sentinel);
  }

  let data = [];
  let cursor = 0;
  let done   = false;

  function renderNext(){
    if (!data.length || done) return;
    const slice = data.slice(cursor, cursor + BATCH);
    if (slice.length){
      grid.insertAdjacentHTML('beforeend', slice.map(card).join(''));
      cursor += slice.length;
    }
    if (cursor >= data.length){
      done = true;
      observer.disconnect();
    }
  }

  const observer = new IntersectionObserver((entries)=>{
    if (entries.some(e => e.isIntersecting)) renderNext();
  }, {
    root: scroller || null,
    rootMargin: '400px 0px 400px 0px',
    threshold: 0.01
  });

  loadWork().then(list=>{
    data = Array.isArray(list) ? list : [];
    // If nothing loaded, generate 24 placeholders just to keep layout from looking broken
    if (!data.length){
      data = Array.from({length: 24}, (_, i) => ({
        slug: `placeholder-${i+1}`,
        title: `Project ${i+1}`,
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg'
      }));
    }
    renderNext();
    observer.observe(sentinel);
  });
})();