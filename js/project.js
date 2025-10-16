(async function(){
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const res = await fetch('assets/work.json');
  if (!res.ok) return;
  const list = await res.json();
  if (!list.length) return;
  const idx = Math.max(0, list.findIndex(p => p.slug === slug));
  const proj = list[idx] || list[0];
  const next = list[(idx+1) % list.length];
  document.getElementById('docTitle').textContent = `${proj.title} — Seth Easter`;
  document.getElementById('title').textContent = proj.title;
  document.getElementById('meta').textContent = [proj.client, proj.year, proj.role].filter(Boolean).join(' · ');
  document.getElementById('desc').textContent = proj.description || '';
  const hero = document.getElementById('heroImg');
  hero.src = (proj.gallery && proj.gallery.length) ? proj.gallery[0] : proj.cover;
  hero.alt = proj.title;
  const thumbs = document.getElementById('thumbs');
  const imgs = (proj.gallery && proj.gallery.length) ? proj.gallery : [];
  if (imgs.length > 1) {
    thumbs.hidden = false;
    thumbs.innerHTML = imgs.map(src => `<img src="${src}" alt="">`).join('');
    thumbs.addEventListener('click', (e) => {
      const t = e.target;
      if (t.tagName === 'IMG') hero.src = t.src;
    });
  }
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.href = `project.html?slug=${encodeURIComponent(next.slug)}`;
})();