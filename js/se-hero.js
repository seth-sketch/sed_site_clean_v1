/* Hero: play video once (if provided) then loop slides */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function renderImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function renderVideo(src, ondone){
    stage.innerHTML = '<span class="ratio-169"><video muted playsinline autoplay src="'+src+'"></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if(ondone) ondone(); return; }
    v.addEventListener('ended', function(){ if(ondone) ondone(); });
    v.addEventListener('error', function(){ if(ondone) ondone(); });
  }

  function tryInline(){
    var el = document.getElementById('seSlidesJSON');
    if (!el) return null;
    try{ var cfg = JSON.parse((el.textContent||'').trim()); return cfg; }catch(e){ return null; }
  }
  function tryExternal(){
    return fetch('/assets/hero/seSlides.json?ts='+Date.now(), { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .catch(function(){ return null; });
  }

  function start(cfg){
    var slides = (cfg && cfg.slides && cfg.slides.length) ? cfg.slides
      : ['/assets/hero/slide1.jpg','/assets/hero/slide2.jpg','/assets/hero/slide3.jpg'];
    var interval = (cfg && cfg.interval) || 4000;
    var i = 0;
    function loop(){
      renderImg(slides[i]);
      i = (i+1) % slides.length;
      setTimeout(loop, interval);
    }
    if (cfg && cfg.video){ renderVideo(cfg.video, loop); }
    else { loop(); }
  }

  var inline = tryInline();
  if (inline) start(inline);
  else tryExternal().then(start);
})();