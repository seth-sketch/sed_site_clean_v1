/* /js/se-hero.js — plays /assets/hero/reel.mp4 once, then rotates slides. ES5 only. */
(function () {
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function readInlineCfg() {
    var el = document.getElementById('seSlidesJSON');
    if (!el) return null;
    try { return JSON.parse(el.textContent || el.innerText || ''); } catch (_) { return null; }
  }
  function fetchCfg(cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/hero/seSlides.json?' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { cb(JSON.parse(xhr.responseText)); } catch (e) { cb(null); }
        } else cb(null);
      }
    };
    xhr.send();
  }

  function showImg(src) {
    stage.innerHTML = '<span class="ratio-169"><img src="' + src + '" alt=""></span>';
  }
  function showVideo(src, onDone) {
    if (!src) { if (onDone) onDone(); return; }
    stage.innerHTML = '<span class="ratio-169"><video src="' + src + '" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v) { if (onDone) onDone(); return; }
    v.addEventListener('ended', function(){ if (onDone) onDone(); });
    v.addEventListener('error', function(){ if (onDone) onDone(); });
  }

  function start(cfg) {
    var slides = (cfg && cfg.slides && cfg.slides.length) ? cfg.slides : [
      '/assets/hero/slide1.jpg',
      '/assets/hero/slide2.jpg',
      '/assets/hero/slide3.jpg'
    ];
    var interval = (cfg && cfg.interval) || 4000;
    var i = 0;

    function rotate() {
      if (!slides.length) return;
      showImg(slides[i]);
      i = (i + 1) % slides.length;
      window.setTimeout(rotate, interval);
    }

    if (cfg && cfg.video) showVideo(cfg.video, rotate);
    else rotate();
  }

  var inline = readInlineCfg();
  if (inline) start(inline);
  else fetchCfg(function (fileCfg) { start(fileCfg); });
})();