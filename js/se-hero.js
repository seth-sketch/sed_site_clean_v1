(function(){
  var el = document.getElementById('heroStage');
  if (!el) return;

  var jsonEl = document.getElementById('seSlidesJSON');
  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]'); } catch(e){ slides = []; }
  if (!slides || !slides.length) return;

  var i = 0;
  function show(){
    el.innerHTML = '<img src="'+ slides[i] +'" alt="">';
    i = (i + 1) % slides.length;
  }
  show();
  setInterval(show, 4000);
})();
