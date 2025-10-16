(function(){
  const app = document.getElementById('workApp');
  if(!app) return;

  function qs(name){
    const m = new URLSearchParams(location.search).get(name);
    return m ? decodeURIComponent(m) : null;
  }

  async function getItems(){
    const res = await fetch('../assets/work.json', {cache:'no-store'});
    return await res.json();
  }

  function gridView(items){
    app.innerHTML = `
      <section class="section">
        <h2>All Work</h2>
        <div class="band">
          <div class="scroller" id="workScroller">
            <div class="grid" id="grid"></div>
          </div>
        </div>
      </section>`;

    const grid = document.getElementById('grid');
    const scroller = document.getElementById('workScroller');

    const card = (it)=> `
      <article class="card">
        <a class="cover" href="index.html?slug=${encodeURIComponent(it.slug)}">
          <div class="ratio-169">
            <img src="${(it.images&&it.images[0])||''}" alt="${it.title||''}">
          </div>
        </a>
        <div class="footer">
          <a href="index.html?slug=${encodeURIComponent(it.slug)}">${it.title||'Untitled'}</a>
          <div class="meta">${[it.org,it.year,it.role].filter(Boolean).join(' · ')}</div>
        </div>
      </article>`;

    let rendered = 0;
    function renderChunk(n){
      const slice = items.slice(rendered, rendered+n);
      if(!slice.length) return false;
      grid.insertAdjacentHTML('beforeend', slice.map(card).join(''));
      rendered += slice.length;
      return true;
    }
    renderChunk(12);
    scroller.addEventListener('scroll', ()=>{
      if(scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80){
        renderChunk(6);
      }
    });
  }

  function detailView(items, slug){
    const idx = items.findIndex(x => x.slug === slug);
    const current = idx >= 0 ? items[idx] : null;
    if(!current){ app.innerHTML = '<p>Project not found.</p>'; return; }

    const next = items[(idx + 1) % items.length];
    const mainImg = (current.images && current.images[0]) || '';

    app.innerHTML = `
      <section class="section">
        <h2>${current.title || ''}</h2>
        <div class="work-detail">
          <div>
            <div class="detail-media">
              <div class="ratio-169">
                <img id="detailMain" src="${mainImg}" alt="${current.title || ''}">
              </div>
            </div>
            <div class="detail-thumbs" id="thumbs"></div>
            <div class="detail-actions">
              <a class="btn btn-secondary" href="../index.html">Home</a>
              <a class="btn" href="index.html?slug=${encodeURIComponent(next.slug)}">Next project</a>
            </div>
          </div>
          <aside class="detail-meta">
            <div class="meta"><strong>Organization:</strong> ${current.org || ''}</div>
            <div class="meta"><strong>Year:</strong> ${current.year || ''}</div>
            <div class="meta"><strong>Role:</strong> ${current.role || ''}</div>
            ${current.description ? `<p class="meta-big" style="margin-top:12px">${current.description}</p>` : ''}
          </aside>
        </div>
      </section>`;

    const thumbs = document.getElementById('thumbs');
    const mainEl = document.getElementById('detailMain');
    (current.images || []).forEach((src, i)=>{
      const img = new Image();
      img.src = src; img.alt = (current.title||'') + ' ' + (i+1);
      img.addEventListener('click', ()=>{ mainEl.src = src; });
      thumbs.appendChild(img);
    });
  }

  (async function init(){
    const items = await getItems();
    const slug = qs('slug');
    if(slug){ detailView(items, slug); }
    else{ gridView(items); }
  })();
})();