/* Hero crossfade (ES5): reads #seSlidesJSON and shows video once, then slides */
(function () {
  var stage = document.getElementById('heroStage');
  var cfgEl = document.getElementById('seSlidesJSON');
  if (!stage || !cfgEl) return;

  var cfg = { slides: [], interval: 4000, video: null };
  try {
    var raw = cfgEl.textContent || cfgEl.innerText || '[]';
    var parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      cfg.slides = parsed;
    } else {
      cfg.slides   = parsed.slides || [];
      cfg.interval = parsed.interval || 4000;
      cfg.video    = parsed.video || null;
    }
  } catch (_){}

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideoOnce(src, done){
    if (!src) { done(); return; }
    stage.innerHTML =
      '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ done(); return; }
    var next = function(){ v.removeEventListener('ended', next); v.removeEventListener('error', next); done(); };
    v.addEventListener('ended', next);
    v.addEventListener('error', next);
    v.play().catch(next);
  }

  var i = 0;
  function rotate(){
    if (!cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideoOnce(cfg.video, rotate); else rotate();
})();