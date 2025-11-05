(function(){
  'use strict';
  if (window.__WORK_V3__) return; window.__WORK_V3__ = true;

  const $=(s,r=document)=>r.querySelector(s);
  const h=(t,a={},...kids)=>{
    const e=document.createElement(t);
    for(const [k,v] of Object.entries(a)){
      if(k==='class') e.className=v;
      else if(k==='html') e.innerHTML=v;
      else e.setAttribute(k,v);
    }
    kids.flat().forEach(c=>{ if(c==null) return; if(typeof c==='string') e.appendChild(document.createTextNode(c)); else e.appendChild(c); });
    return e;
  };
  const fix=p=>!p?p:(/^https?:\/\//i.test(p)||p.startsWith('/'))?p:'/'+p.replace(/^\/+/,'');
  async function getJSON(u){
    const url=u+(u.includes('?')?'&':'?')+'v='+Date.now();
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status+' for '+u);
    return r.json();
  }

  const section = $('#work') || document.body;
  let grid = $('#workGrid', section);
  if (!grid){ const host=section.querySelector('.container')||section; grid=h('div',{id:'workGrid'}); host.appendChild(grid); }
  grid.textContent='Loading…';

  (async function(){
    let items;
    try{ items = await getJSON('/assets/work.json'); }catch(e){
      grid.innerHTML='<div style="padding:12px;border:1px solid #833;border-radius:0!important;background:#220;"><strong>Could not load /assets/work.json</strong></div>';
      return;
    }
    if(!Array.isArray(items)||!items.length){ grid.innerHTML='<div style="padding:12px;border:1px solid #444;border-radius:0! important;background:#151515;">No projects found.</div>'; return; }

    grid.innerHTML='';
    items.forEach((raw,i)=>{
      const gallery = Array.isArray(raw.gallery)? raw.gallery.map(fix) : [];
      const media = Array.isArray(raw.media)&&raw.media.length
        ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)}))
        : gallery.map(src=>({type:'image',src}));
      const cover = raw.cover ? fix(raw.cover) : (gallery[0] || (media[0]&&media[0].src));
      const slug  = (raw.slug || raw.id || `item-${i+1}`).trim();
      const title = raw.title || 'Project';
      const meta  = [raw.role, raw.client, raw.year].filter(Boolean).join(' • ');

      const card = h('article',{class:'work-card'});
      const top  = h('div',{class:'thumbs'});

      // Use /project/ (with trailing slash) so CF serves /project/index.html
      const a    = h('a',{href:'/project/?slug='+encodeURIComponent(slug),'aria-label':title});
      const img  = h('img',{src:cover,alt:title,class:'thumb',loading:'lazy'});
      img.addEventListener('error',()=> img.style.opacity=0.35);
      a.appendChild(img);
      top.appendChild(a);
      card.appendChild(top);

      const body = h('div',{class:'body'},
        meta ? h('div',{class:'kicker'}, meta) : null,
        h('h3',{}, title),
        raw.description ? h('div',{class:'meta'}, raw.description) : null
      );
      card.appendChild(body);

      // Fallback: clicking anywhere on the card goes too
      card.addEventListener('click', (e)=>{
        // only if you didn’t click a link already:
        if (e.target.tagName !== 'A' && e.target.closest('a')==null){
          location.href = '/project/?slug='+encodeURIComponent(slug);
        }
      });

      grid.appendChild(card);
    });
  })();
})();