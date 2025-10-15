(function(){
  const grid = document.getElementById('grid');
  const scroller = document.getElementById('workScroller');
  if(!grid || !scroller) return;
  const items = Array.from({length: 24}).map((_,i)=>({
    title:`Project ${i+1}`,
    org: 'ABC News', year: 2020 + (i%6),
    role: 'Production Designer',
    img: `assets/thumbs/thumb${(i%12)+1}.jpg`, href: '#'
  }));
  const card = (it)=> `<article class="card">
      <a class="coverLink" href="${it.href}">
        <img class="cover" src="${it.img}" alt="${it.title}">
      </a>
      <div class="footer">
        <a href="${it.href}">${it.title}</a>
        <div class="meta">${it.org} · ${it.year} · ${it.role}</div>
      </div>
    </article>`;
  let rendered = 0;
  function render(n){ grid.insertAdjacentHTML('beforeend', items.slice(rendered, rendered+n).map(card).join('')); rendered += n; }
  render(12);
  scroller.addEventListener('scroll', ()=>{
    if(scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 80){
      if(rendered < items.length) render(6);
    }
  });
})();