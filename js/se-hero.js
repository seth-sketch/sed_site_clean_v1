/* Hero: plays optional video once, then rotates slides */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  // read config
  var cfg = { slides: [], interval: 4000, video: null };
  try{
    var el = document.getElementById('seSlidesJSON');
    if (el){
      var raw = el.textContent || el.innerText || '[]';
      var data = JSON.parse(raw);
      if (Array.isArray(data)) cfg.slides = data;
      else {
        cfg.video = data.video || null;
        cfg.slides = data.slides || [];
        cfg.interval = data.interval || 4000;
      }
    }
  }catch(_){}

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideo(src, done){
    stage.innerHTML = '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if (done) done(); return; }
    v.addEventListener('ended', function(){ if (done) done(); });
    v.addEventListener('error', function(){ if (done) done(); });
  }

  var i = 0;
  function rotate(){
    if (!cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideo(cfg.video, rotate); else rotate();
})();