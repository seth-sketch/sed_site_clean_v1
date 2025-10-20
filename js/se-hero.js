(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var cfgEl = document.getElementById('seSlidesJSON');
  var cfg = { slides: [], interval: 4000 };
  try {
    if (cfgEl) {
      var raw = cfgEl.textContent || cfgEl.innerText || '[]';
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) cfg.slides = parsed;
      else {
        cfg.video = parsed.video;
        cfg.slides = parsed.slides || [];
        cfg.interval = parsed.interval || 4000;
      }
    }
  } catch(_) {}

  function showImg(src){
    stage.innerHTML =
      '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideo(src, onDone){
    stage.innerHTML =
      '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if (onDone) onDone(); return; }
    v.addEventListener('ended', function(){ if (onDone) onDone(); });
    v.addEventListener('error', function(){ if (onDone) onDone(); });
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