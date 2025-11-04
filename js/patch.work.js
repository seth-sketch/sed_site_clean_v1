(function(){
  'use strict';

  // Guard: don't run twice if accidentally included twice
  if (window.__WORK_PATCH_LOADED__) return; window.__WORK_PATCH_LOADED__ = true;

  function $(sel,scope){ return (scope||document).querySelector(sel); }
  function h(t,a={},...kids){
    const el=document.createElement(t);
    Object.entries(a).forEach(([k,v])=> k==='class'? (el.className=v) : k==='html'? (el.innerHTML=v) : el.setAttribute(k,v));
    kids.flat().forEach(c=> c==null ? 0 : (typeof c==='string' ? el.appendChild(document.createTextNode(c)) : el.appendChild(c)));
    return el;
  }
  const qs = (sel,root=document)=> Array.from(root.querySelectorAll(sel));
  const fix = p => (!p? p : (/^https?:\/\//i.test(p)||p.startsWith('/') ? p : '/'+p.replace(/^\/+/,'')));

  async function fetchJSON(u){
    const r = await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(), {cache:'no-store'});
    return r.json();
  }

  function normalize(raw, i){
    const gallery = Array.isArray(raw.gallery) ? raw.gallery.map(fix) : [];
    const media = Array.isArray(raw.media) && raw.media.length
      ? raw.media.map(m => m && m.type ? ({...m, src:fix(m.src)}) : ({type:'image', src:fix(m)}))
      : gallery.map(src => ({type:'image', src}));
    return {
      id: raw.id || raw.slug || `item-${i+1}`,
      title: raw.title || '',
      client: raw.client || '',
      role: raw.role || '',
      year: Number(raw.year || 0),
      cover: fix(raw.cover),
      thumbs: Array.isArray(raw.thumbs) && raw.thumbs.length ? raw.thumbs.map(fix) : gallery,
      media,
      description: raw.description || ''
    };
  }

  // Choose a container that exists on /work/
  const main = $('main') || document.body;
  const section = $('#work') || main;
  let grid = $('#workGrid') || $('.work-grid', section) || $('.grid', section);
  if (!grid){
    const host = $('.container', section) || section;
    grid = h('div',{id:'workGrid', class:'work-grid'});
    host.appendChild(grid);
  }

  // Lightbox (single instance)
  let lb = $('#work-lightbox');
  if (!lb){
    lb = h('div',{id:'work-lightbox', class:'lb', 'aria-hidden':'true'},
      h('div',{class:'lb-main'},
        h('button',{id:'work-lb-prev',class:'lb-prev','aria-label':'Previous'},'‹'),
        h('div',{id:'work-lb-content'}),
        h('button',{id:'work-lb-next',class:'lb-next','aria-label':'Next'},'›'),
        h('button',{id:'work-lb-close',class:'lb-close','aria-label':'Close'},'✕')
      ),
      h('div',{id:'work-lb-strip',class:'lb-strip'})
    );
    document.body.appendChild(lb);
  }
  const lbc = $('#work-lb-content'),
        lbs = $('#work-lb-strip'),
        btnX= $('#work-lb-close'),
        btnP= $('#work-lb-prev'),
        btnN= $('#work-lb-next');

  let current = { item:null, index:0 };

  function openLB(item, idx){ current.item=item; current.index=idx; renderLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); lbc.innerHTML=''; lbs.innerHTML=''; document.body.style.overflow=''; }
  function prev(){ if(!current.item) return; current.index = (current.index - 1 + current.item.media.length) % current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index = (current.index + 1) % current.item.media.length; renderLB(); }

  function renderLB(){
    const media = current.item.media || [];
    const m = media[current.index];
    lbc.innerHTML = '';
    if (!m){ lbc.textContent = 'No media'; return; }
    if (m.type === 'video'){
      const v = h('video',{src:m.src,controls:true,playsinline:true});
      lbc.appendChild(v);
    } else {
      lbc.appendChild(h('img',{src:m.src,alt:m.alt||current.item.title}));
    }
    lbs.innerHTML = '';
    media.forEach((it,i)=>{
      const thumbSrc = it.type==='image' ? it.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img',{src:thumbSrc,alt:it.alt||('Item '+(i+1))});
      if (i===current.index) t.classList.add('active');
      t.addEventListener('click',()=>{ current.index=i; renderLB(); });
      lbs.appendChild(t);
    });
  }
  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });

  function cardThumb(src, alt, onClick){
    const img = h('img',{src,alt:alt||'thumb',class:'thumb',loading:'lazy'});
    img.addEventListener('click', onClick);
    img.addEventListener('error', ()=> img.style.opacity = 0.25);
    return img;
  }

  function renderCard(item){
    const card = h('article',{class:'work-card'});
    const allImgs = (item.thumbs && item.thumbs.length) ? item.thumbs : item.media.filter(m=>m.type==='image').map(m=>m.src);
    const first3 = allImgs.slice(0,3);
    const rest   = allImgs.slice(3);

    const grid3 = h('div',{class:'thumbs'});
    first3.forEach((src, i)=> grid3.appendChild(cardThumb(src, `${item.title} ${i+1}`, ()=> openLB(item, i))));
    card.appendChild(grid3);

    if (rest.length){
      const extra = h('div',{class:'extra-thumbs'});
      rest.forEach((src, i)=> extra.appendChild(cardThumb(src, `${item.title} ${i+4}`, ()=> openLB(item, i+3))));
      card.appendChild(extra);
    }

    const meta = [item.role, item.client, item.year || ''].filter(Boolean).join(' • ');
    const body = h('div',{class:'body'},
      meta ? h('div',{class:'kicker'}, meta) : null,
      h('h3',{}, item.title || ''),
      item.description ? h('div',{class:'meta'}, item.description) : null
    );
    card.appendChild(body);

    return card;
  }

  (async function(){
    let list = await fetchJSON('/assets/work.json').catch(()=>[]);
    list = Array.isArray(list) ? list.map(normalize) : [];
    grid.innerHTML='';
    list.forEach(item => grid.appendChild(renderCard(item)));
  })();
})();