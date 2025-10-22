/* Hero slideshow: plays optional video once, then rotates images */
(function () {
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var cfg = { video:null, slides:[], interval:4000 };
  var cfgEl = document.getElementById('seSlidesJSON');
  try {
    if (cfgEl) {
      var raw = cfgEl.textContent || cfgEl.innerText || '[]';
      var data = JSON.parse(raw);
      if (Array.isArray(data)) cfg.slides = data;
      else if (data && typeof data === 'object') {
        cfg.video    = data.video || null;
        cfg.slides   = Array.isArray(data.slides) ? data.slides : [];
        cfg.interval = +data.interval || 4000;
      }
    }
  } catch (e) { /* ignore bad JSON */ }

  function set(html){ stage.innerHTML = html; }
  function showImg(src){
    set('<img alt="" src="'+src+'">');
  }
  function showVideo(src, done){
    set('<video src="'+src+'" muted playsinline autoplay></video>');
    var v = stage.querySelector('video');
    if (!v) { done && done(); return; }
    v.addEventListener('ended', function(){ done && done(); });
    v.addEventListener('error', function(){ done && done(); });
  }

  var i = 0;
  function rotate(){
    if (!cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideo(cfg.video, rotate);
  else rotate();
})();