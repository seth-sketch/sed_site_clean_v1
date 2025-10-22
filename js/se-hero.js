/* Hero: plays optional video once, then rotates slides. ES5-safe. */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function renderImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function renderVideo(src, done){
    stage.innerHTML =
      '<span class="ratio-169"><video muted playsinline autoplay>' +
      '<source src="'+src+'" type="video/mp4"></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if (done) done(); return; }
    v.addEventListener('ended', function(){ if (done) done(); });
    v.addEventListener('error', function(){ if (done) done(); });
  }

  function startRotation(cfg){
    var list = cfg && cfg.slides ? cfg.slides.slice(0) : [];
    var delay = (cfg && cfg.interval) || 4000;
    if (!list.length) return;
    var i = 0;
    function tick(){
      renderImg(list[i]);
      i = (i + 1) % list.length;
      setTimeout(tick, delay);
    }
    tick();
  }

  function cfgFromInline(){
    try{
      var el = document.getElementById('seSlidesJSON');
      if (!el) return null;
      var txt = el.textContent || el.innerText || '';
      if (!txt) return null;
      return JSON.parse(txt);
    }catch(e){ return null; }
  }

  function cfgFromFile(cb){
    var url = '/assets/hero/seSlides.json?v=' + (new Date().getTime());
    fetch(url, { cache:'no-store' })
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .then(function(j){ cb(j); })
      .catch(function(){ cb(null); });
  }

  cfgFromFile(function(cfg){
    if (!cfg) cfg = cfgFromInline() || { slides:[], interval:4000 };
    if (cfg.video){
      renderVideo(cfg.video, function(){ startRotation(cfg); });
    }else{
      startRotation(cfg);
    }
  });
})();