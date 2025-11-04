(function () {
  const grid   = document.getElementById('workGrid');
  const lb     = document.getElementById('work-lightbox');
  const ctn    = document.getElementById('work-lb-content');
  const strip  = document.getElementById('work-lb-strip');
  const btnX   = document.getElementById('work-lb-close');
  const btnP   = document.getElementById('work-lb-prev');
  const btnN   = document.getElementById('work-lb-next');
  const bodyEl = document.body;

  let current = { item: null, index: 0 };

  // helpers
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    });
    kids.flat().forEach(k => { if (k==null) return; typeof k === 'string' ? el.appendChild(document.createTextNode(k)) : el.appendChild(k); });
    return el;
  }
  async function loadJSON(url) {
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now());
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return await r.json();
  }
  // compat
  function fixPath(p){ if(!p) return p; if(/^https?:\/\//i.test(p) || p.startsWith('/')) return p; return '/' + p.replace(/^\/+/, ''); }
  function normalizeItem(raw, idx){
    return {
      id:    raw.id || raw.slug || `item-${idx+1}`,
      title: raw.title || '',
      client: raw.client || '',
      role:  raw.role || '',
      year:  Number(raw.year || 0),
      cover: fixPath(raw.cover),
      thumbs: (raw.thumbs?.length ? raw.thumbs : (raw.gallery || [])).map(fixPath),
      media: (raw.media?.length
        ? raw.media.map(m => (m.type ? {...m, src: fixPath(m.src)} : {type:'image', src: fixPath(m)}))
        : (raw.gallery || []).map(src => ({ type:'image', src: fixPath(src) }))
      ),
      description: raw.description || ''
    };
  }

  // UI
  function createThumb(src, alt, onClick){
    const img = h('img', {src, alt: alt||'thumb', class:'thumb', loading:'lazy'});
    img.addEventListener('click', onClick);
    img.addEventListener('error', ()=> img.style.opacity = 0.2);
    return img;
  }
  function renderCard(item, openLightbox){
    const card = h('article', {class:'work-card'});
    const imgList = (item.thumbs && item.thumbs.length) ? item.thumbs : (item.media||[]).filter(m=>m.type==='image').map(m=>m.src);
    const first3 = imgList.slice(0,3);
    const rest   = imgList.slice(3);

    const grid3 = h('div', {class:'thumbs'});
    first3.forEach((src, idx)=> grid3.appendChild(createThumb(src, item.title+' '+(idx+1), ()=> openLightbox(item, idx))));
    card.appendChild(grid3);

    if (rest.length){
      const extra = h('div', {class:'extra-thumbs'});
      rest.forEach((src, idx)=> extra.appendChild(createThumb(src, item.title+' '+(idx+4), ()=> openLightbox(item, idx+3))));
      card.appendChild(extra);
    }

    const metaLine = [item.role, item.client, item.year || ''].filter(Boolean).join(' • ');
    const body = h('div', {class:'body'},
      metaLine ? h('div', {class:'kicker'}, metaLine) : null,
      h('h3', {}, item.title || ''),
      item.description ? h('div', {class:'meta'}, item.description) : null
    );
    card.appendChild(body);
    return card;
  }

  function openLB(item, index){
    current.item  = item;
    current.index = Math.max(0, Math.min(index||0, (item.media||[]).length - 1));
    renderLB();
    lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
    bodyEl.style.overflow='hidden';
  }
  function closeLB(){
    lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
    ctn.innerHTML=''; strip.innerHTML=''; bodyEl.style.overflow='';
  }
  function renderLB(){
    const media = current.item.media || [];
    const m = media[current.index];
    ctn.innerHTML='';
    if(!m){ ctn.textContent='No media'; return; }
    if(m.type==='video'){ const v=h('video',{src:m.src,controls:true,playsinline:true}); v.style.maxHeight='80vh'; ctn.appendChild(v); }
    else { ctn.appendChild(h('img',{src:m.src,alt:m.alt||current.item.title})); }
    strip.innerHTML='';
    media.forEach((it,i)=>{
      const thumbSrc = it.type==='image' ? it.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img',{src:thumbSrc,alt:it.alt||('Item '+(i+1))});
      if(i===current.index) t.classList.add('active');
      t.addEventListener('click',()=>{ current.index=i; renderLB(); });
      strip.appendChild(t);
    });
  }
  function prev(){ if(!current.item) return; current.index=(current.index-1+current.item.media.length)%current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index=(current.index+1)%current.item.media.length; renderLB(); }

  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });

  document.addEventListener('keydown', e=>{ if(!lb.classList.contains('open')) return;
    if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });

  let sx=null;
  lb.addEventListener('touchstart', e=>{ sx=e.changedTouches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>50){ dx>0?prev():next(); } sx=null; });

  window.addEventListener('pageshow', closeLB);
  window.addEventListener('beforeunload', closeLB);

  document.addEventListener('DOMContentLoaded', async ()=>{
    let data = await loadJSON('/assets/work.json');
    data = (Array.isArray(data) ? data : []).map(normalizeItem);
    grid.innerHTML='';
    data.forEach(item => grid.appendChild(renderCard(item, (it, idx)=> openLB(it, idx))));
  });
})();