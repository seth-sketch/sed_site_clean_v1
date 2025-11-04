<script>
(function(){
  'use strict';
  if (window.__WORK_V3__) return; window.__WORK_V3__ = true;

  const $ = (s, r=document)=> r.querySelector(s);
  const h = (t,a={},...kids)=>{const e=document.createElement(t);for(const[k,v]of Object.entries(a))k==='class'?e.className=v:k==='html'?e.innerHTML=v:e.setAttribute(k,v);kids.flat().forEach(c=>c==null?0:typeof c==='string'?e.appendChild(document.createTextNode(c)):e.appendChild(c));return e;};
  const fix = p => (!p? p : (/^https?:\/\//i.test(p)||p.startsWith('/') ? p : '/'+p.replace(/^\/+/,'') ));

  async function getJSON(u){ const r = await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(), {cache:'no-store'}); return r.json(); }

  function normalize(raw,i){
    const gallery = Array.isArray(raw.gallery) ? raw.gallery.map(fix) : [];
    const media = Array.isArray(raw.media)&&raw.media.length ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)})) : gallery.map(src=>({type:'image',src}));
    const cover = raw.cover ? fix(raw.cover) : (gallery[0] || (media[0] && media[0].src));
    return {
      slug: raw.slug || raw.id || `item-${i+1}`,
      title: raw.title || '',
      client: raw.client || '',
      role: raw.role || '',
      year: raw.year || '',
      cover, media,
      description: raw.description || ''
    };
  }

  const main = $('main') || document.body;
  const workSection = $('#work') || main;
  let grid = $('#workGrid', workSection);
  if (!grid){
    const host = $('.container', workSection) || workSection;
    grid = h('div', {id:'workGrid'});
    host.appendChild(grid);
  }

  (async function(){
    let items = await getJSON('/assets/work.json').catch(()=>[]);
    items = Array.isArray(items) ? items.map(normalize) : [];
    grid.innerHTML = '';
    items.forEach(it=>{
      const card = h('article',{class:'work-card'});
      const top = h('div',{class:'thumbs'});
      const img = h('img',{src: it.cover, alt: it.title||'project', class:'thumb', loading:'lazy'});
      img.addEventListener('click', ()=> location.href = '/project?slug='+encodeURIComponent(it.slug));
      top.appendChild(img);
      card.appendChild(top);
      const metaText = [it.role, it.client, it.year].filter(Boolean).join(' • ');
      const body = h('div',{class:'body'},
        metaText ? h('div',{class:'kicker'}, metaText) : null,
        h('h3',{}, it.title||''),
        it.description ? h('div',{class:'meta'}, it.description) : null
      );
      card.appendChild(body);
      grid.appendChild(card);
    });
  })();
})();
</script>// JavaScript Document