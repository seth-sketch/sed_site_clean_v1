(function(){
  const qp = new URLSearchParams(location.search);
  const slug = qp.get('slug') || '';

  const titleEl = document.getElementById('projTitle');
  const metaEl  = document.getElementById('projMeta');
  const descEl  = document.getElementById('projDesc');
  const viewer  = document.getElementById('projViewer');
  const strip   = document.getElementById('projStrip');

  const lb     = document.getElementById('proj-lightbox');
  const lbc    = document.getElementById('proj-lb-content');
  const lbs    = document.getElementById('proj-lb-strip');
  const btnX   = document.getElementById('proj-lb-close');
  const btnP   = document.getElementById('proj-lb-prev');
  const btnN   = document.getElementById('proj-lb-next');

  let current = { item:null, index:0 };

  function fixPath(p){ if(!p) return p; if(/^https?:\/\//i.test(p)||p.startsWith('/')) return p; return '/' + p.replace(/^\/+/, ''); }
  function normalizeItem(raw, idx){
    return {
      id: raw.id || raw.slug || `item-${idx+1}`,
      title: raw.title || '',
      client: raw.client || '',
      role: raw.role || '',
      year: Number(raw.year || 0),
      cover: fixPath(raw.cover),
      thumbs: (raw.thumbs?.length ? raw.thumbs : (raw.gallery||[])).map(fixPath),
      media: (raw.media?.length ? raw.media.map(m => (m.type? {...m,src:fixPath(m.src)} : {type:'image',src:fixPath(m)}))
                                 : (raw.gallery||[]).map(src=>({type:'image',src:fixPath(src)}))),
      description: raw.description || ''
    };
  }
  function h(t,a={},...k){const e=document.createElement(t);Object.entries(a).forEach(([kk,v])=>kk==='class'?e.className=v:kk==='html'?e.innerHTML=v:e.setAttribute(kk,v));k.flat().forEach(c=>{if(c==null)return;typeof c==='string'?e.appendChild(document.createTextNode(c)):e.appendChild(c)});return e;}
  async function loadJSON(u){ const r=await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now()); if(!r.ok) throw new Error(r.status); return r.json(); }

  function renderMain(item){
    titleEl.textContent = item.title || 'Project';
    const meta = [item.role, item.client, item.year||''].filter(Boolean).join(' • ');
    metaEl.textContent = meta;
    descEl.textContent = item.description || '';

    // show first media IN-PAGE (no lightbox yet)
    openInViewer(item, 0);

    // thumbs strip (scrollable)
    strip.innerHTML='';
    item.media.forEach((m,i)=>{
      const thumbSrc = m.type==='image' ? m.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img',{src:thumbSrc,alt:m.alt||('Item '+(i+1))});
      if(i===0) t.classList.add('active');
      t.addEventListener('click',()=> openInViewer(item,i));
      strip.appendChild(t);
    });
  }

  function openInViewer(item, idx){
    const m = item.media[idx];
    if(!m) return;
    current.item=item; current.index=idx;
    viewer.innerHTML='';
    Array.from(strip.children).forEach((img,i)=> img.classList.toggle('active', i===idx));

    if(m.type==='video'){
      const v=h('video',{src:m.src,controls:true,playsinline:true}); v.style.maxHeight='70vh'; viewer.appendChild(v);
    } else {
      viewer.appendChild(h('img',{src:m.src,alt:m.alt||item.title}));
    }
    // Only when the user taps the main viewer do we open the full-screen lightbox
    viewer.onclick=()=> openLB(item, idx);
  }

  function openLB(item, idx){ current.item=item; current.index=idx; renderLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); lbc.innerHTML=''; lbs.innerHTML=''; document.body.style.overflow=''; }
  function renderLB(){
    const media=current.item.media||[]; const m=media[current.index];
    lbc.innerHTML='';
    if(!m){ lbc.textContent='No media'; return; }
    if(m.type==='video'){ const v=h('video',{src:m.src,controls:true,playsinline:true}); v.style.maxHeight='80vh'; lbc.appendChild(v); }
    else { lbc.appendChild(h('img',{src:m.src,alt:m.alt||current.item.title})); }
    lbs.innerHTML='';
    media.forEach((it,i)=>{
      const thumbSrc = it.type==='image'? it.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t=h('img',{src:thumbSrc,alt:it.alt||('Item '+(i+1))}); if(i===current.index) t.classList.add('active');
      t.addEventListener('click',()=>{ current.index=i; renderLB(); }); lbs.appendChild(t);
    });
  }
  function prev(){ if(!current.item) return; current.index=(current.index-1+current.item.media.length)%current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index=(current.index+1)%current.item.media.length; renderLB(); }

  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown', e=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });
  window.addEventListener('pageshow', closeLB);

  document.addEventListener('DOMContentLoaded', async ()=>{
    let data = await loadJSON('/assets/work.json');
    data = (Array.isArray(data) ? data : []).map(normalizeItem);
    const item = data.find(d => (d.id===slug || d.id===decodeURIComponent(slug))) || data[0];
    if(!item){ titleEl.textContent='Project not found'; return; }
    renderMain(item);
  });
})();