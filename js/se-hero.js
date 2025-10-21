(function(){
  var stage = document.getElementById('heroStage');
  var cfgEl = document.getElementById('seSlidesJSON');
  if (!stage || !cfgEl) return;

  var cfg = { slides: [], interval: 4000 };
  try {
    var raw = cfgEl.textContent || cfgEl.innerText || '[]';
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) cfg.slides = parsed;
    else {
      cfg.video = parsed.video;
      cfg.slides = parsed.slides || [];
      cfg.interval = parsed.interval || 4000;
    }
  } catch(_) {}

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideo(src, onDone){
    stage.innerHTML = '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ onDone && onDone(); return; }
    v.addEventListener('ended', function(){ onDone && onDone(); });
    v.addEventListener('error', function(){ onDone && onDone(); });
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