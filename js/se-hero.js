(function(){
  const jsonEl = document.getElementById('seSlidesJSON');
  if (!jsonEl) return;
  let slides = [];
  try { slides = JSON.parse(jsonEl.textContent || '[]'); } catch(e){}
  const stage = document.getElementById('heroStage');
  if (!stage || !slides.length) return;
  let i = 0;
  function show() {
    stage.innerHTML = `<img src="${slides[i]}" alt="">`;
    i = (i + 1) % slides.length;
  }
  show();
  setInterval(show, 4000);
})();