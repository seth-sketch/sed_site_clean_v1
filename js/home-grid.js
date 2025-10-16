(function(){
  const grid = document.getElementById('grid');
  const scroller = document.getElementById('workScroller');
  if(!grid || !scroller){ console.warn('Work grid containers not found'); return; }

  async function load(){
    try{
      const res = await fetch('assets/work.json', {cache:'no-store'});
      const items = await res.json();
      render(items);
    }catch(e){
      console.warn('work.json not found, falling back to demo', e);
      const items = Array.from({length: 12}).map((_,i)=>({
        slug:`project-${i+1}`,
        title:`Project ${i+1}`,
        org:'ABC News',
        year: 2020 + (i%6),
        role:'Production Designer',
        images:[`assets/thumbs/thumb${(i%12)+1}.jpg`]
      }));
      render(items);
    }
  }

  const card = (it)=> `
    <article class="card">
      <a class="cover" href="work/index.html?slug=${encodeURIComponent(it.slug)}">
        <div class="ratio-169">
          <img src="${(it.images&&it.images[0])||''}" alt="${it.title||''}">
        </div>
      </a>
      <div class="footer">
        <a href="work/index.html?slug=${encodeURIComponent(it.slug)}">${it.title||'Untitled'}</a>
        <div class="meta">${[it.org,it.year,it.role].filter(Boolean).join(' · ')}</div>
      </div>
    </article>`;

  function render(items){
    let rendered = 0;
    function renderChunk(n){
      const slice = items.slice(rendered, rendered+n);
      if(!slice.length) return false;
      grid.insertAdjacentHTML('beforeend', slice.map(card).join(''));
      rendered += slice.length;
      return true;
    }
    renderChunk(12);
    scroller.addEventListener('scroll', ()=>{
      if(scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80){
        renderChunk(6);
      }
    });
  }

  load();
})();