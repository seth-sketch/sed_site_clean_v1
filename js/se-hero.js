(function(){
  var jsonEl = document.getElementById('seSlidesJSON');
  var slides = [];
  try { slides = JSON.parse(jsonEl ? (jsonEl.textContent || jsonEl.innerText || "[]") : "[]"); } catch(e){}
  if (!slides || !slides.length) slides = ["assets/hero/slide1.jpg","assets/hero/slide2.jpg","assets/hero/slide3.jpg"];

  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var i = 0;
  function show(){
    stage.innerHTML = '<img src="'+ slides[i] +'" alt="">';
    i = (i + 1) % slides.length;
  }
  show();
  setInterval(show, 4000);
})();
