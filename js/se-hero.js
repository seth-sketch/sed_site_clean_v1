
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var dataEl = document.getElementById('seSlidesJSON');
  var slides = [];
  try { slides = JSON.parse((dataEl && (dataEl.textContent || dataEl.innerText)) || '[]'); } catch(_){}
  if (!slides || !slides.length) {
    slides = [
      'assets/hero/slide1.jpg',
      'assets/hero/slide2.jpg',
      'assets/hero/slide3.jpg'
    ];
  }

  var img = new Image();
  img.alt = '';
  img.loading = 'eager';
  img.decoding = 'async';
  img.onerror = function(){
    this.onerror = null;
    this.src = 'assets/work/placeholder-16x9.jpg';
  };

  stage.innerHTML = '';
  stage.appendChild(img);

  var i = 0;
  function show(){
    img.src = slides[i] + '?v=' + Date.now();
    i = (i + 1) % slides.length;
  }

  show();
  setInterval(show, 4000);
})();
