
async function fetchJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error('Failed to load '+url); return r.json(); }
function h(tag, attrs={}, ...kids){
  const el = document.createElement(tag);
  for(const [k,v] of Object.entries(attrs||{})){
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const k of kids.flat()){
    if (k==null) continue;
    if (typeof k === 'string') el.appendChild(document.createTextNode(k));
    else el.appendChild(k);
  }
  return el;
}
function createThumb(src, alt, onClick){
  const img = h('img', {src, alt: alt||'thumb', class:'thumb', loading:'lazy'});
  img.addEventListener('click', onClick);
  return img;
}
function renderCard(item, openLightbox){
  const card = h('article', {class:'work-card'});
  const thumbs = (item.thumbs||[]);
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
  function open(item, index){
    current.item = item;
    current.index = index || 0;
    render();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function close(){
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
      const v = h('video', {src:m.src, controls:true, autoplay:false});
      v.style.maxHeight = '80vh';
      content.appendChild(v);
    } else {
      const img = h('img', {src:m.src, alt:m.alt||current.item.title});
      content.appendChild(img);
    }
    strip.innerHTML = '';
    media.forEach((it, i)=>{
      if (it.type === 'image'){
        const t = h('img', {src: it.src, alt: it.alt||('Image '+(i+1))});
        if (i === current.index) t.classList.add('active');
        t.addEventListener('click', ()=>{ current.index = i; render(); });
        strip.appendChild(t);
      } else {
        const t = h('img', {src: it.poster || 'data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"80\"><rect width=\"120\" height=\"80\" fill=\"%23000\"/><polygon points=\"45,25 45,55 75,40\" fill=\"%23fff\"/></svg>'});
        if (i === current.index) t.classList.add('active');
        t.addEventListener('click', ()=>{ current.index = i; render(); });
        strip.appendChild(t);
      }
    });
  }
  function prev(){ if(!current.item) return; current.index = (current.index - 1 + current.item.media.length) % current.item.media.length; render(); }
  function next(){ if(!current.item) return; current.index = (current.index + 1) % current.item.media.length; render(); }
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  document.addEventListener('keydown', (e)=>{
    if (lb.classList.contains('open')){
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
  });
  let sx = null;
  lb.addEventListener('touchstart', (e)=>{ sx = e.changedTouches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', (e)=>{
    if (sx==null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50){ dx > 0 ? prev() : next(); }
    sx = null;
  });
  lb.addEventListener('click', (e)=>{ if (e.target.id === 'lightbox') close(); });
  return { open, close };
}
document.addEventListener('DOMContentLoaded', async ()=>{
  const grid = document.getElementById('workGrid');
  const lb = Lightbox();
  const data = await fetchJSON('/assets/work.json');
  data.forEach(item=>{
    const card = renderCard(item, (item, idx)=> lb.open(item, idx));
    grid.appendChild(card);
  });
});
