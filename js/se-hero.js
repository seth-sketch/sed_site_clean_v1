(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  // If reel.mp4 exists, play it first; otherwise use slides JSON
  function tryVideoThenSlides(slides){
    var videoUrl = 'assets/hero/reel.mp4';
    fetch(videoUrl, {method:'HEAD'}).then(function(r){
      if (r.ok){
        stage.innerHTML =
          '<video autoplay muted playsinline loop>' +
          '<source src="'+videoUrl+'" type="video/mp4">' +
          '</video>';
      } else {
        runSlides(slides);
      }
    }).catch(function(){ runSlides(slides); });
  }

  function runSlides(slides){
    if (!slides || !slides.length) return;
    var i = 0;
    function show(){
      stage.innerHTML = '<img src="'+slides[i]+'" alt="">';
      i = (i+1) % slides.length;
    }
    show();
    setInterval(show, 4000);
  }

  var conf = document.getElementById('seSlidesJSON');
  var slides = [];
  try { slides = conf ? JSON.parse(conf.textContent) : []; } catch(e){}
  tryVideoThenSlides(slides);
})();