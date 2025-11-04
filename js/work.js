async function fetchJSON(url){
  try {
    const r = await fetch(url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now());
    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return await r.json();
  } catch (e) {
    const grid = document.getElementById('workGrid');
    grid.innerHTML = '<div class="meta">Could not load assets/work.json (' + e.message + ').</div>';
    console.error('work.json load failed:', e);
    return [];
  }
}

function h(tag, attrs={}, ...kids){
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if (k==='class') el.className=v;
    else if (k==='html') el.innerHTML=v;
    else el.setAttribute(k,v);
  });
  kids.flat().forEach(k=>{
    if (k==null) return;
    if (typeof k==='string') el.appendChild(document.createTextNode(k));
    else el.appendChild(k);
  });
  return el;
}

function createThumb(src, alt, onClick){
  const img = h('img', {src, alt: alt||'thumb', class:'thumb', loading:'lazy'});
  img.addEventListener('click', onClick);
  img.addEventListener('error', ()=> img.style.opacity = 0.2); // visual hint if bad path
  return img;
}

function renderCard(item, openLightbox){
  const card = h('article', {class:'work-card'});
  const thumbs = item.thumbs || [];
  const first3 = thumbs.slice(0,3);
  const rest = thumbs.slice(3);

  const grid = h('div', {class:'thumbs'});
  first3.forEach((src, idx)=> grid.appendChild(createThumb(src, item.title+' '+(idx+1), ()=> openLightbox(item, idx))));
  card.appendChild(grid);

  if (rest.length){
    const strip = h('div', {class:'extra-thumbs'});
    rest.forEach((src, idx)=> strip.appendChild(createThumb(src, item.title+' '+(idx+4), ()=> openLightbox(item, idx+3))));
    card.appendChild(strip);
  }

  const body = h('div', {class:'body'},
    h('div', {class:'kicker'}, item.client || ''),
    h('h3', {}, item.title || ''),
    h('div', {class:'meta'}, String(item.year || ''))
  );
  card.appendChild(body);
  return card;
}

function Lightbox(){
  const lb = document.getElementById('lightbox');
  const closeBtn = lb.querySelector('.lb-close');
  const prevBtn = lb.querySelector('.lb-prev');
  const nextBtn = lb.querySelector('.lb-next');
  const content = document.getElementById('lbContent');
  const strip = document.getElementById('lbStrip');
  let current = { item:null, index:0 };

  function open(item, index=0){
    current.item = item;
    current.index = index;
    render();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function hardClose(){
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden','true');
    content.innerHTML = '';
    strip.innerHTML = '';
    document.body.style.overflow = '';
  }
  function render(){
    const media = current.item.media || [];
    const m = media[current.index];
    content.innerHTML = '';
    if (!m){ content.textContent = 'No media'; return; }
    if (m.type === 'video'){
      const v = h('video', {src:m.src, controls:true, playsinline:true});
      v.style.maxHeight = '80vh';
      content.appendChild(v);
    } else {
      const img = h('img', {src:m.src, alt:m.alt||current.item.title});
      content.appendChild(img);
    }
    strip.innerHTML = '';
    media.forEach((it, i)=>{
      const thumbSrc = it.type === 'image'
        ? it.src
        : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img', {src: thumbSrc, alt: (it.alt||('Item '+(i+1)))});
      if (i === current.index) t.classList.add('active');
      t.addEventListener('click', ()=>{ current.index = i; render(); });
      strip.appendChild(t);
    });
  }
  function prev(){ if(!current.item) return; current.index = (current.index - 1 + current.item.media.length) % current.item.media.length; render(); }
  function next(){ if(!current.item) return; current.index = (current.index + 1) % current.item.media.length; render(); }

  closeBtn.addEventListener('click', hardClose);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  document.addEventListener('keydown', (e)=>{
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') hardClose();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // swipe
  let sx = null;
  lb.addEventListener('touchstart', (e)=>{ sx = e.changedTouches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', (e)=>{
    if (sx==null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50){ dx > 0 ? prev() : next(); }
    sx = null;
  });

  // safety: if user leaves and returns via back/restore, always reset overlay
  window.addEventListener('pageshow', ()=> hardClose());
  window.addEventListener('beforeunload', ()=> hardClose());

  return { open: (item, idx)=>open(item, idx) };
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const grid = document.getElementById('workGrid');
  const lb = Lightbox();
  const data = await fetchJSON('/assets/work.json');

  if (!data.length){
    grid.insertAdjacentHTML('beforeend','<div class="meta">No work items found.</div>');
    return;
  }
  data.forEach(item=>{
    const card = renderCard(item, (it, idx)=> lb.open(it, idx));
    grid.appendChild(card);
  });
});
