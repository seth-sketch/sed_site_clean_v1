/* Hero slideshow (ES5) */
(function () {
  var stage = document.getElementById('heroStage');
  var cfgEl = document.getElementById('seSlidesJSON');
  if (!stage || !cfgEl) return;

  var cfg = { slides: [], interval: 4000, video: null };
  try {
    var raw = cfgEl.textContent || cfgEl.innerText || '{}';
    var data = JSON.parse(raw);
    if (data) {
      if (data.slides && data.slides.length) cfg.slides = data.slides;
      if (data.interval) cfg.interval = data.interval;
      if (data.video) cfg.video = data.video;
    }
  } catch (_) {}

  function set(h) { stage.innerHTML = '<span class="ratio-169">' + h + '</span>'; }
  function img(src) { set('<img src="' + src + '" alt="">'); }
  function vid(src, done) {
    set('<video src="' + src + '" muted playsinline autoplay></video>');
    var v = stage.querySelector('video'); if (!v) { if (done) done(); return; }
    v.addEventListener('ended', function(){ if (done) done(); });
    v.addEventListener('error', function(){ if (done) done(); });
  }

  var i = 0;
  function rotate(){
    if (!cfg.slides || !cfg.slides.length) return;
    img(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) vid(cfg.video, rotate); else rotate();
})();