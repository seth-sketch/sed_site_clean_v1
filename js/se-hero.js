/* Hero slideshow w/ optional video slide (ES5) */
(function () {
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;

  var list = [];
  try { list = JSON.parse(jsonEl.textContent || jsonEl.innerText || '[]'); } catch(_) {}
  if (!list || !list.length) return;

  stage.style.position = 'relative';
  stage.innerHTML = '';
  function pane(){
    var d = document.createElement('div');
    d.style.position='absolute'; d.style.inset='0';
    d.style.opacity='0'; d.style.transition='opacity 800ms ease';
    stage.appendChild(d); return d;
  }
  var A = pane(), B = pane(), show=A, hide=B, i=0;

  function isVideo(src){ return /\.mp4$|\.webm$|\.ogg$/i.test(src||''); }

  function setMedia(container, src, onready, onfail){
    container.innerHTML = '';
    if (isVideo(src)){
      var v = document.createElement('video');
      v.src = src; v.muted = true; v.autoplay = true; v.playsInline = true; v.loop = false; v.preload = 'metadata';
      v.style.width='100%'; v.style.height='100%'; v.style.objectFit='cover';
      v.onloadeddata = function(){ onready && onready(); };
      v.onerror = function(){ onfail && onfail(); };
      v.onended = function(){ /* allow timer to advance */ };
      container.appendChild(v);
    } else {
      var img = new Image();
      img.onload = function(){ onready && onready(); };
      img.onerror = function(){ onfail && onfail(); };
      img.src = src;
      img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
      container.appendChild(img);
    }
  }

  var T = null;
  function next(){
    clearTimeout(T);
    var src = list[i % list.length];

    hide.style.opacity = '0';
    setMedia(show, src, function(){
      // ready -> fade in
      // small timeout to ensure transition
      setTimeout(function(){ show.style.opacity = '1'; }, 30);
      // Swap panes for next turn
      var tmp = show; show = hide; hide = tmp;
      i++;
      T = setTimeout(next, 5000);
    }, function(){
      // failed: skip to next
      i++; T = setTimeout(next, 0);
    });
  }

  next();
})();