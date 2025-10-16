(function(){
  const grid = document.getElementById('grid');
  const scroller = document.getElementById('workScroller');
  if(!grid || !scroller){ console.warn('Work grid containers not found'); return; }

  // read inline JSON if present
  let items = [];
  const jsonTag = document.getElementById('seWorkJSON');
  if(jsonTag){
    try{ items = JSON.parse(jsonTag.textContent); }catch(e){ console.warn('seWorkJSON parse error', e); }
  }

  // fallback demo items if none provided
  if(!items || !items.length){
    items = Array.from({length:24}).map((_,i)=>({
      title:`Project ${i+1}`,
      org:'ABC News',
      year: 2020 + (i%6),
      role:'Production Designer',
      img:`assets/thumbs/thumb${(i%12)+1}.jpg`,
      href:'#'
    }));
  }

  const card = (it)=> `
    <article class="card">
      <a class="cover" href="${it.href||'#'}">
        <div class="ratio-169">
          <img src="${it.img}" alt="${it.title||''}">
        </div>
      </a>
      <div class="footer">
        <a href="${it.href||'#'}">${it.title||'Untitled'}</a>
        <div class="meta">${[it.org,it.year,it.role].filter(Boolean).join(' · ')}</div>
      </div>
    </article>
  `;

  function renderChunk(start, count){
    const slice = items.slice(start, start+count);
    if(!slice.length) return false;
    grid.insertAdjacentHTML('beforeend', slice.map(card).join(''));
    return true;
  }

  let rendered = 0;
  renderChunk(rendered, 12); rendered += 12;

  scroller.addEventListener('scroll', ()=>{
    if(scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80){
      if(renderChunk(rendered, 6)) rendered += 6;
    }
  });
})();