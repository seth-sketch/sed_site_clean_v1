(function(){
  'use strict';
  if (window.__HOME_GRID_SAFE__) return; window.__HOME_GRID_SAFE__ = true;

  const grid = document.querySelector('#homeGrid');
  if (!grid) return;

  function h(t,attrs,...kids){
    const e=document.createElement(t);
    for (const [k,v] of Object.entries(attrs||{})){
      if (k==='class') e.className=v;
      else if (k==='html') e.innerHTML=v;
      else e.setAttribute(k,v);
    }
    kids.flat().forEach(c=> c==null?0: e.appendChild(typeof c==='string'?document.createTextNode(c):c));
    return e;
  }
  const fix = p => (!p ? '' : (/^https?:\/\//i.test(p)||p.startsWith('/') ? p : '/'+p.replace(/^\/+/,'') ));

  (async()=>{
    let txt,data;
    try{
      const r = await fetch('/assets/work.json?v='+Date.now(), {cache:'no-store'});
      txt = await r.text();
      data = JSON.parse(txt);
    }catch(err){
      console.error('work.json parse failed:', err, txt);
      grid.replaceChildren(h('div',{class:'meta'},'Work is updating — refresh shortly.'));
      return;
    }
    grid.innerHTML='';
    (Array.isArray(data)?data:[]).forEach((it,i)=>{
      const img = fix(it.cover || (it.gallery && it.gallery[0]));
      if (!img) return; // skip broken item, don’t blank the page
      const slug = it.slug || `item-${i+1}`;
      const card = h('article',{class:'work-card'},
        h('a',{href:'/project?slug='+encodeURIComponent(slug),'aria-label':it.title||'Project'},
          h('img',{src:img,alt:it.title||'',loading:'lazy',decoding:'async'})
        ),
        h('div',{class:'body'},
          (it.role||it.client||it.year) ? h('div',{class:'kicker'},[it.role,it.client,it.year].filter(Boolean).join(' • ')) : null,
          h('h3',{}, it.title||'')
        )
      );
      grid.appendChild(card);
    });
  })();
})();
