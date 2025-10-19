
(function(){
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]'); } catch (e) { slides = []; }
  if (!slides || !slides.length) return;

  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p) || p.charAt(0) === '/') return p;
    return '/' + p.replace(/^\.?\//, '');
  }
  for (var i=0; i<slides.length; i++) slides[i] = abs(slides[i]);

  stage.innerHTML = '<img class="hero-img" alt=""><img class="hero-img" alt="">';
  stage.style.position = 'relative';

  var imgs = stage.getElementsByClassName('hero-img');
  for (var k=0; k<imgs.length; k++){
    var im = imgs[k];
    im.style.position = 'absolute';
    im.style.left = im.style.right = im.style.top = im.style.bottom = '0';
    im.style.width = '100%';
    im.style.height = '100%';
    im.style.objectFit = 'cover';
    im.style.opacity = '0';
    im.style.transition = 'opacity 700ms ease';
  }

  var A = imgs[0], B = imgs[1];
  var show = A, hide = B;
  var idx = 0;

  function reveal(img){
    if (img.complete) { img.style.opacity = '1'; return; }
    img.onload = function(){ img.style.opacity = '1'; };
  }

  function cycle(){
    var src = slides[idx % slides.length];
    hide.style.opacity = '0';
    show.src = src;
    reveal(show);
    var tmp = show; show = hide; hide = tmp;
    idx++;
  }
  cycle();
  setInterval(cycle, 4500);
})();
