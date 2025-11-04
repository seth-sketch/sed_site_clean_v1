(async function(){
  const pressEl = document.getElementById('pressList');
  const awardsEl= document.getElementById('awardsList');

  async function loadJSON(url){
    const r = await fetch(url + (url.includes('?')?'&':'?') + 'v=' + Date.now());
    if(!r.ok) throw new Error(r.status + ' ' + r.statusText);
    return r.json();
  }
  function li(html){ const li=document.createElement('li'); li.innerHTML=html; return li; }

  try {
    // adjust filenames if yours differ
    const press   = await loadJSON('/assets/press.json').catch(()=>[]);
    const awards  = await loadJSON('/assets/awards.json').catch(()=>[]);

    // Press items: {title, source, url, date}
    if(Array.isArray(press) && press.length){
      pressEl.innerHTML='';
      press.forEach(p=>{
        const d = p.date ? ` <span class="subtle">(${p.date})</span>` : '';
        const s = p.source ? ` — <span class="subtle">${p.source}</span>` : '';
        pressEl.appendChild(li(`<a href="${p.url}" target="_blank" rel="noopener">${p.title||'Article'}</a>${s}${d}`));
      });
    } else {
      pressEl.innerHTML = '<li class="subtle">No press items found.</li>';
    }

    // Awards: {year, title, organization}
    if(Array.isArray(awards) && awards.length){
      awardsEl.innerHTML='';
      awards.forEach(a=>{
        const org = a.organization ? ` — <span class="subtle">${a.organization}</span>` : '';
        awardsEl.appendChild(li(`<strong>${a.year||''}</strong> ${a.title||''}${org}`));
      });
    } else {
      awardsEl.innerHTML = '<li class="subtle">No awards listed.</li>';
    }
  } catch (e) {
    pressEl.innerHTML  = '<li>Could not load press.json</li>';
    awardsEl.innerHTML = '<li>Could not load awards.json</li>';
    console.error(e);
  }
})();