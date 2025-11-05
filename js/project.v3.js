(function(){
  'use strict';
  if (window.__WORK_V3__) return; window.__WORK_V3__ = true;

  const $=(s,r=document)=>r.querySelector(s);
  const h=(t,a={},...kids)=>{const e=document.createElement(t);
    for(const[k,v]of Object.entries(a)) k==='class'?e.className=v : k==='html'?e.innerHTML=v : e.setAttribute(k,v);
    kids.flat().forEach(c=> c==null?0 : (typeof c==='string'? e.appendChild(document.createTextNode(c)) : e.appendChild(c)));
    return e;
  };
  const fix=p=>!p?p:(/^https?:\/\//i.test(p)||p.startsWith('/'))?p:'/'+p.replace(/^\/+/,'');
  async function getJSON(u){ const r=await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(),{cache:'no-store'}); return r.json(); }

  const section = $('#work') || document.body;
  let grid = $('#workGrid', section);
  if (!grid){ grid = h('div',{id:'workGrid'}); (section.querySelector('.container')||section).appendChild(grid); }

  (async function(){
    let items = await getJSON('/assets/work.json').catch(()=>[]);
    if(!Array.isArray(items)) return;
    grid.innerHTML='';
    items.forEach((raw,i)=>{
      const gallery = Array.isArray(raw.gallery)? raw.gallery.map(fix) : [];
      const media = Array.isArray(raw.media)&&raw.media.length
        ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)}))
        : gallery.map(src=>({type:'image',src}));
      const cover = raw.cover ? fix(raw.cover) : (gallery[0] || (media[0]&&media[0].src));
      const slug  = raw.slug || raw.id || `item-${i+1}`;

      const card = h('article',{class:'work-card'});
      const top  = h('div',{class:'thumbs'});
      const a    = h('a',{href:'/project?slug='+encodeURIComponent(slug),'aria-label':(raw.title||'Project')});
      a.appendChild(h('img',{src:cover,alt:raw.title||'',class:'thumb',loading:'lazy'}));
      top.appendChild(a); card.appendChild(top);

      const meta = [raw.role, raw.client, raw.year].filter(Boolean).join(' • ');
      const body = h('div',{class:'body'},
        meta ? h('div',{class:'kicker'}, meta) : null,
        h('h3',{}, raw.title || ''),
        raw.description ? h('div',{class:'meta'}, raw.description) : null
      );
      card.appendChild(body);
      grid.appendChild(card);
    });
  })();
})();