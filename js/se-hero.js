(function(){
  var jsonEl = document.getElementById('seSlidesJSON');
  var stage  = document.getElementById('heroStage');
  if (!jsonEl || !stage) return;

  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]'); } catch(e){}
  if (!slides.length) return;

  var i = 0;
  function show(){
    stage.innerHTML = '<img src="'+ slides[i] +'" alt="">';
    i = (i+1) % slides.length;
  }
  show();
  setInterval(show, 4000);
})();