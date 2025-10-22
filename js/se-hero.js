/* Hero crossfade (ES5) — plays optional video, then rotates slides */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var cfg = { slides: [], interval: 4000, video: null };
  var jsonEl = document.getElementById('seSlidesJSON');
  try{
    if (jsonEl){
      var raw = jsonEl.textContent || jsonEl.innerText || '[]';
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) { cfg.slides = parsed; }
      else {
        cfg.video = parsed.video || null;
        cfg.slides = parsed.slides || [];
        cfg.interval = parsed.interval || cfg.interval;
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
    if (!cfg.slides || !cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideo(cfg.video, rotate); else rotate();
})();