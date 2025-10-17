/* Hero crossfade (ES5) — reads #seSlidesJSON and crossfades two <img>s */
(function () {
  var stage  = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  // Parse slide list
  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]'); } catch (e) {}
  if (!slides || !slides.length) return;

  // Normalize paths so it works from / and /work/
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p) || p.charAt(0) === '/') return p;
    return '/' + p.replace(/^\.?\//, '');
  }
  for (var i=0;i<slides.length;i++) slides[i] = abs(slides[i]);

  // Two layered imgs we fade between
  stage.innerHTML = '<img class="hero-img" alt=""><img class="hero-img" alt="">';
  stage.style.position = 'relative';

  var imgs = stage.getElementsByClassName('hero-img');
  for (var k=0;k<imgs.length;k++){
    var im = imgs[k];
    im.style.position   = 'absolute';
    im.style.top = im.style.left = im.style.right = im.style.bottom = '0';
    im.style.width      = '100%';
    im.style.height     = '100%';
    im.style.objectFit  = 'cover';
    im.style.opacity    = '0';
    im.style.transition = 'opacity 700ms ease';
  }

  var A = imgs[0], B = imgs[1];
  var show = A, hide = B;
  var idx = 0;

  function reveal(img){
    // if cached, onload won't fire — handle both cases
    if (img.complete) {
      show.style.opacity = '0';
      img.style.opacity  = '1';
      var tmp = show; show = img; hide = tmp;
    } else {
      img.onload = function(){
        show.style.opacity = '0';
        img.style.opacity  = '1';
        var tmp = show; show = img; hide = tmp;
      };
    }
  }

  function next(){
    idx = (idx + 1) % slides.length;
    hide.style.opacity = '0';
    hide.src = slides[idx];
    reveal(hide);
  }

  // First image
  A.onload = function(){ A.style.opacity = '1'; };
  A.src = slides[0];

  // Start cycling
  if (slides.length > 1) {
    B.src = slides[1]; // warm second
    setInterval(next, 4000);
  }
})();