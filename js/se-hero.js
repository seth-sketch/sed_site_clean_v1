/* se-hero.js — plays optional video once, then rotates slides */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function cfgFromScript(){
    var el = document.getElementById('seSlidesJSON');
    if (!el) return null;
    try{
      var raw = el.textContent || el.innerText || '';
      return JSON.parse(raw);
    }catch(e){ return null; }
  }

  var cfg = cfgFromScript() || { slides: [], interval: 4000 };

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideo(src, onDone){
    stage.innerHTML =
      '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
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
    setTimeout(rotate, cfg.interval || 4000);
  }

  if (cfg.video) showVideo(cfg.video, rotate); else rotate();
})();