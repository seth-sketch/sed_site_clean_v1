/* Infinite Scroll Grid
   - Detects container: #homeGrid, #grid, or #workGrid
   - Renders in batches of 12 via IntersectionObserver
   - Expects grid inside .scroller (falls back to window)
*/
(function(){
  const BATCH = 12;
  const grid = document.getElementById('homeGrid') || document.getElementById('grid') || document.getElementById('workGrid');
  if (!grid) { console.warn('No grid container found'); return; }

  function findScroller(el){
    let n = el;
    while (n && n !== document.body){
      if (n.classList && n.classList.contains('scroller')) return n;
      n = n.parentNode;
    }
    return null;
  }
  const scroller = findScroller(grid);

  const workPaths = [
    "assets/work.json?v="+Date.now(),
    "./assets/work.json?v="+Date.now(),
    "/assets/work.json?v="+Date.now()
  ];
  async function fetchFirst(paths){
    for (const p of paths){
      try{ const r = await fetch(p, { cache:"no-store" }); if (r.ok) return await r.json(); }catch(e){}
    }
    return [];
  }

  function esc(s){ return String(s||''); }
  function card(p){
    const title = esc(p.title);
    const meta  = [p.client, p.year, p.role].filter(Boolean).map(esc).join(" · ");
    const img   = esc(p.cover || (p.gallery && p.gallery[0]) || "");
    let href    = "#";
    if (p.slug) href = "project.html?slug="+encodeURIComponent(p.slug);
    else if (p.href) href = esc(p.href);

    const cover = img ? `<span class="ratio-169"><img loading="lazy" src="${img}" alt=""></span>`
                      : `<span class="ratio-169" style="background:#eef2ff"></span>`;

    return `<article class="card">
      <a class="cover" href="${href}">${cover}</a>
      <div class="footer">
        <a href="${href}">${title}</a>
        <div class="meta">${meta}</div>
      </div>
    </article>`;
  }

  let data = [];
  let cursor = 0;
  const sentinel = document.createElement('div');
  sentinel.id = "gridSentinel";
  sentinel.style.height = "1px";
  sentinel.style.width  = "100%";
  (grid.parentNode || document.body).appendChild(sentinel);

  function renderNext(){
    if (!data.length) return;
    const next = data.slice(cursor, cursor + BATCH);
    if (next.length){
      const html = next.map(card).join("");
      grid.insertAdjacentHTML('beforeend', html);
      cursor += next.length;
    }
  }

  let finished = false;
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(ent => {
      if (finished) return;
      if (ent.isIntersecting){
        renderNext();
        if (cursor >= data.length){
          finished = true;
          observer.disconnect();
        }
      }
    });
  }, {
    root: scroller || null,
    rootMargin: "300px 0px",
    threshold: 0.01
  });

  fetchFirst(workPaths).then(list => {
    data = Array.isArray(list) ? list : [];
    renderNext();
    observer.observe(sentinel);
  });
})();