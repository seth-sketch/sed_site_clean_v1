/* se-hero.js — robust hero video+slideshow (vanilla ES5)
   - Reads config JSON from <script id="seSlidesJSON"> { video, slides[], interval }
   - If `video` is present, plays once, then rotates through slides.
   - Bullet‑proof for static hosting (no frameworks). */

(function () {
  var stage = document.getElementById('heroStage');
  var cfgEl = document.getElementById('seSlidesJSON');
  if (!stage || !cfgEl) return;

  // Parse config safely
  var cfg = { slides: [], interval: 4000, video: null };
  try {
    var raw = cfgEl.textContent || cfgEl.innerText || '{}';
    var data = JSON.parse(raw);
    if (data) {
      if (data.slides && data.slides.length) cfg.slides = data.slides;
      if (data.interval) cfg.interval = +data.interval || cfg.interval;
      if (data.video) cfg.video = data.video;
    }
  } catch (_) {}

  // Helpers
  function clear(el){ while (el.firstChild) el.removeChild(el.firstChild); }
  function el(tag, attrs, children){
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs){
      if (k === 'class') e.className = attrs[k];
      else if (k === 'style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if (children) for (var i=0;i<children.length;i++){
      var c = children[i];
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return e;
  }

  function showImg(src){
    var pic = el('img', { src: src, alt: '' }, null);
    var wrap = el('div', { class: 'ratio-169' }, [pic]);
    // fade swap
    var next = el('div', { class: 'se-slide' }, [wrap]);
    next.style.opacity = '0';
    next.style.transition = 'opacity 400ms ease';
    stage.appendChild(next);
    requestAnimationFrame(function(){ next.style.opacity = '1'; });
    // remove previous slide after fade
    var prev = stage.children.length > 1 ? stage.children[0] : null;
    if (prev) setTimeout(function(){ if (prev.parentNode) prev.parentNode.removeChild(prev); }, 450);
  }

  function showVideo(src, onDone){
    clear(stage);
    var v = el('video', {
      src: src, playsinline: '', muted: '', autoplay: '', preload: 'auto'
    }, null);
    // video should fill the 16:9 box as well
    var wrap = el('div', { class: 'ratio-169' }, [v]);
    stage.appendChild(wrap);

    // Play best-effort; when it ends or errors, continue
    function finish(){ if (onDone) onDone(); }
    v.addEventListener('ended', finish);
    v.addEventListener('error', finish);

    // Some browsers require a play() call
    try { var p = v.play(); if (p && p.then) p.catch(function(){ /* ignore */ }); } catch(_){}
  }

  // Start rotation
  var i = 0;
  function rotate(){
    if (!cfg.slides || !cfg.slides.length) return;
    showImg(cfg.slides[i]);
    i = (i + 1) % cfg.slides.length;
    setTimeout(rotate, cfg.interval);
  }

  if (cfg.video) showVideo(cfg.video, rotate); else rotate();
})();