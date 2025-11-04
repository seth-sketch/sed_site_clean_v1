<script>
(function(){
  'use strict';
  if (window.__PROJ_V3__) return; window.__PROJ_V3__ = true;

  const $ = (s, r=document)=> r.querySelector(s);
  const h = (t,a={},...kids)=>{const e=document.createElement(t);for(const[k,v]of Object.entries(a))k==='class'?e.className=v:k==='html'?e.innerHTML=v:e.setAttribute(k,v);kids.flat().forEach(c=>c==null?0:typeof c==='string'?e.appendChild(document.createTextNode(c)):e.appendChild(c));return e;};
  const fix = p => (!p? p : (/^https?:\/\//i.test(p)||p.startsWith('/') ? p : '/'+p.replace(/^\/+/,'') ));
  async function getJSON(u){ const r = await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(), {cache:'no-store'}); return r.json(); }

  function normalize(raw,i){
    const gallery = Array.isArray(raw.gallery) ? raw.gallery.map(fix) : [];
    const media = Array.isArray(raw.media)&&raw.media.length ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)})) : gallery.map(src=>({type:'image',src}));
    return {
      id: raw.id || raw.slug || `item-${i+1}`,
      slug: raw.slug || raw.id || `item-${i+1}`,
      title: raw.title || '',
      client: raw.client || '',
      role: raw.role || '',
      year: raw.year || '',
      media,
      description: raw.description || ''
    };
  }

  const qp = new URLSearchParams(location.search);
  const slug = qp.get('slug') || '';

  const main = $('main') || document.body;
  const container = $('.container', main) || main;

  // Ensure our anchors exist INSIDE the container
  let shell = $('#project-shell', container);
  if (!shell){
    shell = h('section',{id:'project-shell',class:'section'});
    container.appendChild(shell);
  }
  let titleEl = $('#projTitle', shell) || shell.appendChild(h('h2',{id:'projTitle'}));
  let metaEl  = $('#projMeta', shell)  || shell.appendChild(h('div',{id:'projMeta',class:'subtle'}));
  let viewer  = $('#projViewer', shell) || shell.appendChild(h('div',{id:'projViewer'}));
  let strip   = $('#projStrip', shell)  || shell.appendChild(h('div',{id:'projStrip'}));
  let descEl  = $('#projDesc', shell)   || shell.appendChild(h('div',{id:'projDesc',class:'meta'}));

  // Optional lightbox
  let lb = $('#lbV3');
  if (!lb){
    lb = h('div',{id:'lbV3','aria-hidden':'true'},
      h('div',{class:'main'},
        h('button',{class:'prev','aria-label':'Previous'},'‹'),
        h('div',{id:'lbV3c'}),
        h('button',{class:'next','aria-label':'Next'},'›'),
        h('button',{class:'x','aria-label':'Close'},'✕')
      ),
      h('div',{class:'strip',id:'lbV3s'})
    );
    document.body.appendChild(lb);
  }
  const lbc = $('#lbV3c'), lbs = $('#lbV3s'), btnX=$('#lbV3 .x'), btnP=$('#lbV3 .prev'), btnN=$('#lbV3 .next');
  let current = { item:null, index:0 };

  function openLB(item,idx){ current.item=item; current.index=idx; renderLB(); lb.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeLB(){ lb.classList.remove('open'); lbc.innerHTML=''; lbs.innerHTML=''; document.body.style.overflow=''; }
  function prev(){ if(!current.item) return; current.index=(current.index-1+current.item.media.length)%current.item.media.length; renderLB(); }
  function next(){ if(!current.item) return; current.index=(current.index+1)%current.item.media.length; renderLB(); }

  function renderLB(){
    const media=current.item.media||[]; const m=media[current.index]; lbc.innerHTML='';
    if(!m) return;
    if(m.type==='video'){ lbc.appendChild(h('video',{src:m.src,controls:true,playsinline:true})); }
    else { lbc.appendChild(h('img',{src:m.src,alt:current.item.title||''})); }
    lbs.innerHTML='';
    media.forEach((it,i)=>{
      const ts = it.type==='image'? it.src : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t = h('img',{src:ts,alt:'thumb'});
      if(i===current.index) t.classList.add('active');
      t.addEventListener('click',()=>{ current.index=i; renderLB(); });
      lbs.appendChild(t);
    });
  }
  btnX.addEventListener('click', closeLB);
  btnP.addEventListener('click', prev);
  btnN.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
  document.addEventListener('keydown', e=>{ if(!lb.classList.contains('open')) return; if(e.key==='Escape') closeLB(); if(e.key==='ArrowLeft') prev(); if(e.key==='ArrowRight') next(); });

  function openInViewer(item, idx){
    const m = item.media[idx]; if(!m) return;
    viewer.innerHTML='';
    Array.from(strip.children).forEach((img,i)=> img.classList.toggle('active', i===idx));
    if(m.type==='video'){ viewer.appendChild(h('video',{src:m.src,controls:true,playsinline:true})); }
    else { viewer.appendChild(h('img',{src:m.src,alt:item.title||''})); }
    // open LB only when clicking the big hero
    viewer.onclick = ()=> openLB(item, idx);
  }

  (async function(){
    let list = await getJSON('/assets/work.json').catch(()=>[]);
    list = Array.isArray(list) ? list.map(normalize) : [];
    const item = list.find(d => d.slug===slug || d.id===slug) || list[0];
    if(!item) return;

    // Meta + Desc
    titleEl.textContent = item.title || 'Project';
    metaEl.textContent  = [item.role, item.client, item.year].filter(Boolean).join(' • ');
    descEl.textContent  = item.description || '';

    // Thumbs
    strip.innerHTML='';
    item.media.forEach((m,i)=>{
      const ts = m.type==='image'? m.src : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const t  = h('img',{src:ts,alt:'thumb'});
      if(i===0) t.classList.add('active');
      t.addEventListener('click',()=> openInViewer(item,i));
      strip.appendChild(t);
    });
    openInViewer(item, 0);
  })();
})();
</script>// JavaScript Document