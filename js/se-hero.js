/* Hero crossfade (ES5) — reads #seSlidesJSON and crossfades two <img>s */
(function () {
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  // Read slide list
  var slides = [];
  try {
    slides = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]');
  } catch (e) {}
  if (!slides || !slides.length) return;

  // Normalize paths so it works from / and /work/
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p) || p.charAt(0) === '/') return p;
    return '/' + p.replace(/^\.\?\/*/, '');
  }
  for (var i=0;i<slides.length;i++) slides[i] = abs(slides[i]);

  // Two layered <img> elements for a simple crossfade
  stage.style.position = 'relative';
  stage.innerHTML = '<img class="hero-img" alt=""><img class="hero-img" alt="">';
  var imgs = stage.getElementsByClassName('hero-img');
  for (var k=0;k<imgs.length;k++){
    var im = imgs[k];
    im.style.position = 'absolute';
    im.style.top = im.style.left = im.style.right = im.style.bottom = '0';
    im.style.width = '100%';
    im.style.height = '100%';
    im.style.objectFit = 'cover';
    im.style.opacity = '0';
    im.style.transition = 'opacity 900ms ease';
  }

  var A = imgs[0], B = imgs[1];
  var show = A, hide = B;
  var idx = 0;

  function reveal(img){
    img.onload = function(){ img.style.opacity = '1'; };
    // Handle cached images as well
    if (img.complete) { setTimeout(function(){ img.style.opacity = '1'; }, 30); }
  }

  function next(){
    var src = slides[idx % slides.length];
    hide.style.opacity = '0';
    show.src = src;
    reveal(show);

    // swap
    var t = show; show = hide; hide = t;
    idx++;
  }

  // Kick off and loop
  next();
  setInterval(next, 5000);
})();