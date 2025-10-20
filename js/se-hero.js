/* Hero crossfade with optional first video, then slides */
(function(){
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
  } catch(_){}

  function setHTML(html){ stage.innerHTML = html; }
  function showImg(src){
    setHTML('<span class="ratio-169"><img class="hero-img" src="'+src+'" alt=""></span>');
  }
  function showVideo(src, next){
    setHTML('<span class="ratio-169"><video class="hero-video" src="'+src+'" muted playsinline autoplay></video></span>');
    var v = stage.querySelector('video');
    if (!v) { next && next(); return; }
    var done = function(){ next && next(); };
    v.addEventListener('ended', done);
    v.addEventListener('error', done);
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