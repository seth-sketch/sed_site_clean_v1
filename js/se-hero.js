/* se-hero.js — robust hero: video (if present) then slides */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  // Read JSON config
  var cfgEl = document.getElementById('seSlidesJSON');
  var cfg = { slides: [], interval: 4000, video: null };
  try {
    if (cfgEl) {
      var raw = cfgEl.textContent || cfgEl.innerText || '[]';
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cfg.slides = parsed;
      } else {
        cfg.video = parsed.video || null;
        cfg.slides = parsed.slides || [];
        cfg.interval = parsed.interval || 4000;
      }
    }
  } catch(_) {}

  function showImg(src){
    stage.innerHTML =
      '<span class="ratio-169"><img src="'+ src +'" alt=""></span>';
  }

  function rotateSlides(){
    if (!cfg.slides || !cfg.slides.length) return;
    var i = 0;
    function tick(){
      showImg(cfg.slides[i]);
      i = (i + 1) % cfg.slides.length;
      setTimeout(tick, cfg.interval);
    }
    tick();
  }

  function tryVideoThenSlides(){
    if (!cfg.video) { rotateSlides(); return; }

    // Build video element
    stage.innerHTML =
      '<span class="ratio-169"><video muted playsinline preload="auto"></video></span>';
    var v = stage.querySelector('video');
    if (!v) { rotateSlides(); return; }

    v.src = cfg.video;
    v.autoplay = true;

    var started = false;
    var watchdog = setTimeout(function(){
      if (!started) fallback();
    }, 2400);

    function onPlaying(){ started = true; clearTimeout(watchdog); }
    function onEnded(){ cleanup(); rotateSlides(); }
    function onError(){ fallback(); }

    function cleanup(){
      v.removeEventListener('playing', onPlaying);
      v.removeEventListener('ended', onEnded);
      v.removeEventListener('error', onError, true);
      clearTimeout(watchdog);
    }
    function fallback(){
      cleanup();
      rotateSlides();
    }

    v.addEventListener('playing', onPlaying);
    v.addEventListener('ended', onEnded);
    v.addEventListener('error', onError, true);

    // Kick it
    var p = v.play();
    if (p && typeof p.then === 'function') {
      p.catch(function(){ fallback(); });
    }
  }

  tryVideoThenSlides();
})();