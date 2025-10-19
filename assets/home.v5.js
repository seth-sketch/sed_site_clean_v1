
(function(){
  const PAGE = 9;
  let order = [], i = 0;
  const grid = document.getElementById('grid');
  const box = document.getElementById('scroller');
  function cardHTML(p){
    const meta = `${p.client} · ${p.year} · ${p.role}`;
    const cover = p.thumb ? `<img src='${p.thumb}' alt='' style='width:100%;height:100%;object-fit:cover;display:block'>` : `${p.title}`;
    return `<div class="card">
      <div class="cover">${cover}</div>
      <div class="footer">
        <a href="projects/${p.slug}/index.html">${p.title}</a>
        <div class="meta">${p.client} · ${p.year} · ${p.role}</div>
      </div>
    </div>`;
  }
  function loadMore(){
    if(i >= order.length) return;
    const slice = order.slice(i, i+PAGE);
    grid.insertAdjacentHTML('beforeend', slice.map(cardHTML).join(''));
    i += PAGE;
  }
  function onScroll(){
    if(box.scrollTop + box.clientHeight >= box.scrollHeight - 80){
      loadMore();
    }
  }
  fetch('assets/projects.json').then(r=>r.json()).then(data=>{
    const feat = data.filter(p=>p.featured);
    const rest = data.filter(p=>!p.featured);
    order = [...feat, ...rest];
    loadMore();
    box.addEventListener('scroll', onScroll);
  });
})();
