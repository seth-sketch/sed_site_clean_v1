
(function(){
  'use strict';
  function $(sel, scope){ return (scope||document).querySelector(sel); }
  function byId(id){ return document.getElementById(id); }
  function li(html){ const el=document.createElement('li'); el.innerHTML=html; return el; }
  function fetchJSON(u){ return fetch(u + (u.includes('?')?'&':'?') + 'v=' + Date.now(), {cache:'no-store'}).then(r=>r.json()).catch(()=>[]); }
  async function loadFirst(paths){ for(const p of paths){ try{ const j = await fetchJSON(p); if(Array.isArray(j)) return j; }catch(e){} } return []; }

  const pressEl  = byId('pressList') || byId('press-List') || $('#pressLinks') || $('.press-links') || $('.press-list');
  const awardsEl = byId('awardsList') || $('#awardsList') || $('#awards') || $('.awards-list');

  if (!pressEl && !awardsEl) return; // nothing to render into

  (async function(){
    const press  = await loadFirst(['/assets/press.json','/assets/press-home.json','/assets/data/press.json']);
    const awards = await loadFirst(['/assets/awards.json','/assets/data/awards.json']);

    if (pressEl){
      pressEl.innerHTML = '';
      if (press.length){
        press.forEach(p=>{
          const title  = p.title || 'Article';
          const href   = p.url || '#';
          const source = p.source || p.outlet || '';
          const date   = p.date ? ` <span class="subtle">(${p.date})</span>` : '';
          pressEl.appendChild(li(`<a href="${href}" target="_blank" rel="noopener">${title}</a>${source?` <span class="subtle">— ${source}</span>`:''}${date}`));
        });
      }else{
        pressEl.appendChild(li('<span class="subtle">No press items found.</span>'));
      }
    }

    if (awardsEl){
      awardsEl.innerHTML = '';
      if (awards.length){
        awards.forEach(a=>{
          const yr  = a.year || '';
          const tt  = a.title || '';
          const org = a.organization ? ` <span class="subtle">— ${a.organization}</span>` : '';
          awardsEl.appendChild(li(`<strong>${yr}</strong> ${tt}${org}`));
        });
      }else{
        awardsEl.appendChild(li('<span class="subtle">No awards listed.</span>'));
      }
    }
  })();
})();
