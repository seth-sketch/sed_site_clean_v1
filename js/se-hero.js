/* Hero crossfade (ES5) — reads #seSlidesJSON and crossfades two <img>s */
(function () {
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  // Parse slide list safely (avoid DW's "empty block" warning)
  var raw = jsonEl.textContent || jsonEl.innerText || '[]';
  var slides;
  try { slides = JSON.parse(raw); } catch (e) { slides = []; }
  if (!slides || !slides.length) return;

  // Make paths absolute so it works from / and /work/
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p) || p.charAt(0)==='/') return p;
    return '/' + p.replace(/^\/+/, '');
  }
  for (var i=0;i<slides.length;i++) slides[i] = abs(slides[i]);

  // Two layered <img> elements we crossfade between
  stage.style.position = 'relative';
  stage.innerHTML = '<img class="hero-img" alt=""><img class="hero-img" alt="">';
  var imgs = stage.getElementsByClassName('hero-img');
  for (var k=0; k<imgs.length; k++){
    var im = imgs[k];
    im.style.position = 'absolute';
    im.style.left = im.style.top = im.style.right = im.style.bottom = '0';
    im.style.width = '100%';
    im.style.height = '100%';
    im.style.objectFit = 'cover';
    im.style.opacity = '0';
    im.style.transition = 'opacity 700ms ease';
  }

  var vis = imgs[0], hid = imgs[1], idx = 0;

  function showFirst(src){
    var pre = new Image();
    pre.onload = function(){ vis.src = src; vis.style.opacity = '1'; };
    pre.src = src;
  }

  function fadeNext(){
    var next = slides[idx++ % slides.length];
    var pre = new Image();
    pre.onload = function(){
      hid.src = next;
      hid.style.opacity = '1';
      vis.style.opacity = '0';
      // swap refs
      var t = vis; vis = hid; hid = t;
    };
    pre.src = next;
  }

  showFirst(slides[0]);
  setInterval(fadeNext, 4000);
})();