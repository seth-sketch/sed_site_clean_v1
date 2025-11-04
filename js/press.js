(async function(){
  const awardsEl = document.getElementById('awardsList');
  const pressEl  = document.getElementById('pressList');

  async function loadJSON(url){
    try{
      const r = await fetch(url + (url.includes('?')?'&':'?') + 'v=' + Date.now());
      if(!r.ok) throw new Error(r.status + ' ' + r.statusText);
      return await r.json();
    }catch(e){
      console.warn('load fail', url, e);
      return [];
    }
  }

  function li(html){ const li = document.createElement('li'); li.innerHTML = html; return li; }

  // Awards: allow ["Title (Year)"] or [{title, year, link}]
  const awards = await loadJSON('/assets/awards.json');
  if (Array.isArray(awards) && awards.length){
    awards.forEach(a=>{
      if (typeof a === 'string'){
        awardsEl.appendChild(li(a));
      } else {
        const t = [a.title, a.year].filter(Boolean).join(' • ');
        const html = a.link ? `<a href="${a.link}" target="_blank" rel="noopener">${t}</a>` : t;
        awardsEl.appendChild(li(html));
      }
    });
  } else {
    awardsEl.appendChild(li('<span class="meta">No awards found.</span>'));
  }

  // Press: allow [{title, outlet/source, date, url/link}] or ["..."]
  const press = await loadJSON('/assets/press.json');
  if (Array.isArray(press) && press.length){
    press.forEach(p=>{
      if (typeof p === 'string'){
        pressEl.appendChild(li(p));
      } else {
        const outlet = p.outlet || p.source || '';
        const date = p.date ? ` • ${p.date}` : '';
        const label = [p.title, outlet].filter(Boolean).join(' — ') + date;
        const url = p.url || p.link;
        const html = url ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>` : label;
        pressEl.appendChild(li(html));
      }
    });
  } else {
    pressEl.appendChild(li('<span class="meta">No press found.</span>'));
  }
})();