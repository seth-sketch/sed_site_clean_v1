
(function(){
  'use strict';
  function $(sel,scope){ return (scope||document).querySelector(sel); }
  function byId(id){ return document.getElementById(id); }
  function h(t,a={},...k){const e=document.createElement(t);Object.entries(a).forEach(([kk,v])=>kk==='class'?e.className=v:kk==='html'?e.innerHTML=v:e.setAttribute(kk,v));k.flat().forEach(c=>{if(c==null)return;typeof c==='string'?e.appendChild(document.createTextNode(c)):e.appendChild(c)});return e;}
  function fetchJSON(u){ return fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(),{cache:'no-store'}).then(r=>r.json()); }
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

  // mount lightbox (add-only)
  let lb = byId('work-lightbox');
  if(!lb){
    lb = h('div',{id:'work-lightbox',class:'lb','aria-hidden':'true'}, h('div',{class:'lb-main'},
      h('button',{id:'work-lb-prev',class:'lb-prev','aria-label':'Previous'},'‹'),
      h('div',{id:'work-lb-content'}),
      h('button',{id:'work-lb-next',class:'lb-next','aria-label':'Next'},'›'),
      h('button',{id:'work-lb-close',class:'lb-close','aria-label':'Close'},'✕')
    ), h('div',{id:'work-lb-strip',class:'lb-strip'}));
    document.body.appendChild(lb);
  }
  const ctn   = byId('work-lb-content');
  const strip = byId('work-lb-strip');
  const btnX  = byId('work-lb-close');
  const btnP  = byId('work-lb-prev');
  const btnN  = byId('work-lb-next');
  let current = { item:null, index:0 };

  function openLB(item, idx){ current.item=item; current.index=idx; renderLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); ctn.innerHTML=''; strip.innerHTML=''; document.body.style.overflow=''; }
  function prev(){ if(!current.item) return; current.index=(current.index-1+current.item.media.length)%current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index=(current.index+1)%current.item.media.length; renderLB(); }
  function renderLB(){
    const media=current.item.media||[]; const m=media[current.index];
    ctn.innerHTML='';
    if(!m){ ctn.textContent='No media'; return; }
    if(m.type==='video'){ const v=h('video',{src:m.src,controls:true,playsinline:true}); v.style.maxHeight='80vh'; ctn.appendChild(v); }
    else { ctn.appendChild(h('img',{src:m.src,alt:m.alt||current.item.title})); }
    strip.innerHTML='';
    media.forEach((it,i)=>{
      const thumbSrc = it.type==='image'? it.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t=h('img',{src:thumbSrc,alt:it.alt||('Item '+(i+1))}); if(i===current.index) t.classList.add('active');
      t.addEventListener('click',()=>{ current.index=i; renderLB(); }); strip.appendChild(t);
    });
  }
  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });

  function createThumb(src, alt, onClick){
    const img = h('img',{src,alt:alt||'thumb',class:'thumb',loading:'lazy'});
    img.addEventListener('click', onClick);
    img.addEventListener('error', ()=> img.style.opacity = 0.2);
    return img;
  }
  function renderCard(item, openLightbox){
    const card = h('article',{class:'work-card'});
    const imgList = (item.thumbs && item.thumbs.length) ? item.thumbs : (item.media||[]).filter(m=>m.type==='image').map(m=>m.src);
    const first3 = imgList.slice(0,3);
    const rest   = imgList.slice(3);

    const grid3 = h('div',{class:'thumbs'});
    first3.forEach((src, idx)=> grid3.appendChild(createThumb(src, item.title+' '+(idx+1), ()=> openLightbox(item, idx))));
    card.appendChild(grid3);
    if(rest.length){
      const extra = h('div',{class:'extra-thumbs'});
      rest.forEach((src, idx)=> extra.appendChild(createThumb(src, item.title+' '+(idx+4), ()=> openLightbox(item, idx+3))));
      card.appendChild(extra);
    }
    const metaLine = [item.role, item.client, item.year || ''].filter(Boolean).join(' • ');
    const body = h('div',{class:'body'},
      metaLine ? h('div',{class:'kicker'}, metaLine) : null,
      h('h3',{}, item.title || ''),
      item.description ? h('div',{class:'meta'}, item.description) : null
    );
    card.appendChild(body);
    return card;
  }

  (async function(){
    const container = byId('workGrid') || ($('#homeScroller .grid') || $('.grid'));
    if(!container) return;
    let list = await fetchJSON('/assets/work.json').catch(()=>[]);
    list = (Array.isArray(list)?list:[]).map(normalizeItem);
    container.innerHTML='';
    list.forEach(item => container.appendChild(renderCard(item, (it, idx)=> openLB(it, idx))));
  })();
})();
