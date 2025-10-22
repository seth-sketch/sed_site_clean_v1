/* se-hero.js – reads #seSlidesJSON and renders hero slideshow (video optional) */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function parseCfg(){
    var el = document.getElementById('seSlidesJSON');
    var out = { slides: [], interval: 4000 };
    if (!el) return out;
    try {
      var raw = el.textContent || el.innerText || '{}';
      var cfg = JSON.parse(raw);
      if (Array.isArray(cfg)) { out.slides = cfg; }
      else {
        out.video = cfg.video;
        out.slides = cfg.slides || [];
        out.interval = cfg.interval || 4000;
      }
    } catch(_){}
    return out;
  }

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }

  function showVideo(src, onDone){
    stage.innerHTML = '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if(onDone) onDone(); return; }
    v.addEventListener('ended', function(){ if(onDone) onDone(); });
    v.addEventListener('error', function(){ if(onDone) onDone(); });
  }

  var cfg = parseCfg();
  var i = 0;

  function rotate(){
    if (!cfg.slides || !cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideo(cfg.video, rotate);
  else rotate();
})();