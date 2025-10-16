(async function(){
  const res = await fetch('assets/work.json');
  if (!res.ok) return;
  const data = await res.json();
  function card(p){
    return `
<article class="card">
  <a class="cover" href="project.html?slug=${encodeURIComponent(p.slug)}">
    <span class="ratio-169"><img src="${p.cover}" alt=""></span>
  </a>
  <div class="footer">
    <a href="project.html?slug=${encodeURIComponent(p.slug)}">${p.title}</a>
    <div class="meta">${[p.client, p.year, p.role].filter(Boolean).join(' · ')}</div>
  </div>
</article>`;
  }
  const homeGrid = document.getElementById('homeGrid');
  if (homeGrid) homeGrid.innerHTML = data.slice(0, 9).map(card).join('');
  const workGrid = document.getElementById('workGrid');
  if (workGrid) workGrid.innerHTML = data.map(card).join('');
})();