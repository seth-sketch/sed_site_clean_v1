(async function(){
  const pressEl = document.getElementById('press-List');
  const awardsEl= document.getElementById('awardsList');

  async function loadJSON(url){
    const r = await fetch(url + (url.includes('?')?'&':'?') + 'v=' + Date.now());
    if(!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return r.json();
  }
  async function first(paths){
    for(const p of paths){
      try { const j = await loadJSON(p); if (Array.isArray(j)) return j; } catch(e){}
    }
    return [];
  }
  function li(html){ const el=document.createElement('li'); el.innerHTML=html; return el; }

  // Try common filenames you’ve used before
  const press  = await first([
    '/assets/press.json',
    '/assets/press-home.json',
    '/assets/data/press.json'
  ]);
  const awards = await first([
    '/assets/awards.json',
    '/assets/data/awards.json'
  ]);

  // Render Press
  if (press.length){
    pressEl.innerHTML = '';
    press.forEach(p=>{
      const t = p.title || 'Article';
      const s = p.source ? ` <span class="subtle">— ${p.source}</span>` : '';
      const d = p.date ? ` <span class="subtle">(${p.date})</span>` : '';
      const href = p.url || '#';
      pressEl.appendChild(li(`<a href="${href}" target="_blank" rel="noopener">${t}</a>${s}${d}`));
    });
  } else {
    pressEl.innerHTML = '<li class="subtle">No press items found.</li>';
  }

  // Render Awards
  if (awards.length){
    awardsEl.innerHTML = '';
    awards.forEach(a=>{
      const yr = a.year || '';
      const tt = a.title || '';
      const org = a.organization ? ` <span class="subtle">— ${a.organization}</span>` : '';
      awardsEl.appendChild(li(`<strong>${yr}</strong> ${tt}${org}`));
    });
  } else {
    awardsEl.innerHTML = '<li class="subtle">No awards listed.</li>';
  }
})();