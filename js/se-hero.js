/* Hero slideshow — reads #seSlidesJSON and crossfades images */
(function () {
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || '[]'); } catch (_) {}
  if (!slides || !slides.length) return;

  // make path absolute so it works from / and /work/
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    p = p.replace(/^\.?\//,'');
    return '/' + p;
  }
  slides = slides.map(abs);

  // two layered <img> elements for a simple crossfade
  stage.style.position = 'relative';
  stage.innerHTML = '<img class="hero-img" alt=""><img class="hero-img" alt="">';
  var imgs = stage.querySelectorAll('img');

  for (var k = 0; k < imgs.length; k++) {
    var im = imgs[k];
    im.style.position = 'absolute';
    im.style.inset = '0';
    im.style.width = '100%';
    im.style.height = '100%';
    im.style.objectFit = 'cover';
    im.style.opacity = k === 0 ? '1' : '0';
    im.style.transition = 'opacity .6s ease';
    im.loading = 'eager';
    im.decoding = 'async';
  }

  var i = 0, cur = 0;
  imgs[cur].src = slides[0];

  function swap() {
    i = (i + 1) % slides.length;
    var next = 1 - cur;
    imgs[next].src = slides[i];
    imgs[next].onload = function () {
      imgs[cur].style.opacity = '0';
      imgs[next].style.opacity = '1';
      cur = next;
    };
  }

  // gentle preload
  slides.slice(1).forEach(function (src) { var im = new Image(); im.src = src; });
  setInterval(swap, 4000);
})();