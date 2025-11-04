
(function(){
  'use strict';
  const qp = new URLSearchParams(location.search);
  const slug = qp.get('slug') || '';

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
      media: (raw.media?.length ? raw.media.map(m => (m.type? {...m,src:fixPath(m.src)} : {type:'image',src:fixPath(m)}))
                                 : (raw.gallery||[]).map(src=>({type:'image',src:fixPath(src)}))),
      description: raw.description || ''
    };
  }

  // find container
  const main = $('main') || document.body;
  const container = $('.container', main) || main;

  // title/meta/desc
  const titleEl = byId('projTitle') || $('h2', container) || h('h2',{id:'projTitle'});
  const metaEl  = byId('projMeta')  || h('div',{id:'projMeta',class:'subtle'});
  const descEl  = byId('projDesc')  || h('div',{id:'projDesc',class:'meta'});
  if (!titleEl.parentNode) container.prepend(titleEl);
  if (!metaEl.parentNode)  titleEl.insertAdjacentElement('afterend', metaEl);
  if (!descEl.parentNode)  metaEl.insertAdjacentElement('afterend', descEl);

  // viewer/strip inside same container so width matches site bounds
  let viewer = byId('projViewer');
  if (!viewer){ viewer = h('div',{id:'projViewer', class:'viewer'}); container.appendChild(viewer); }
  let strip  = byId('projStrip');
  if (!strip){ strip = h('div',{id:'projStrip', class:'strip', 'aria-label':'Thumbnails'}); container.appendChild(strip); }

  // Lightbox
  let lb = byId('proj-lightbox');
  if(!lb){
    lb = h('div',{id:'proj-lightbox',class:'lb','aria-hidden':'true'}, h('div',{class:'lb-main'},
      h('button',{id:'proj-lb-prev',class:'lb-prev','aria-label':'Previous'},'‹'),
      h('div',{id:'proj-lb-content'}),
      h('button',{id:'proj-lb-next',class:'lb-next','aria-label':'Next'},'›'),
      h('button',{id:'proj-lb-close',class:'lb-close','aria-label':'Close'},'✕')
    ), h('div',{id:'proj-lb-strip',class:'lb-strip'}));
    document.body.appendChild(lb);
  }
  const lbc = byId('proj-lb-content');
  const lbs = byId('proj-lb-strip');
  const btnX= byId('proj-lb-close');
  const btnP= byId('proj-lb-prev');
  const btnN= byId('proj-lb-next');

  let current = { item:null, index:0 };

  function openLB(item, idx){ current.item=item; current.index=idx; renderLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); lbc.innerHTML=''; lbs.innerHTML=''; document.body.style.overflow=''; }
  function prev(){ if(!current.item) return; current.index=(current.index-1+current.item.media.length)%current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index=(current.index+1)%current.item.media.length; renderLB(); }
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
  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown', e=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });

  function openInViewer(item, idx){
    const m = item.media[idx];
    if(!m) return;
    current.item=item; current.index=idx;
    viewer.innerHTML='';
    Array.from(strip.children).forEach((img,i)=> img.classList.toggle('active', i===idx));
    if(m.type==='video'){ const v=h('video',{src:m.src,controls:true,playsinline:true}); viewer.appendChild(v); }
    else { viewer.appendChild(h('img',{src:m.src,alt:m.alt||item.title})); }
    viewer.onclick=()=> openLB(item, idx);
  }

  (async function(){
    let list = await fetchJSON('/assets/work.json').catch(()=>[]);
    list = (Array.isArray(list)?list:[]).map(normalizeItem);
    const item = list.find(d => (d.id===slug || d.slug===slug || d.id===decodeURIComponent(slug))) || list[0];
    if(!item){ return; }

    // Meta
    const meta = [item.role, item.client, item.year||''].filter(Boolean).join(' • ');
    titleEl.textContent = item.title || 'Project';
    metaEl.textContent  = meta;
    descEl.textContent  = item.description || '';

    // Thumbs
    strip.innerHTML='';
    item.media.forEach((m,i)=>{
      const thumbSrc = m.type==='image'? m.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img',{src:thumbSrc,alt:m.alt||('Item '+(i+1))});
      if(i===0) t.classList.add('active');
      t.addEventListener('click',()=> openInViewer(item, i));
      strip.appendChild(t);
    });
    openInViewer(item, 0);
  })();
})();
