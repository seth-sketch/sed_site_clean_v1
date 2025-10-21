/* Hero: video first, then slides (ES5) */
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  function cfg(){
    var el = document.getElementById('seSlidesJSON');
    var out = { video:null, slides:[], interval:4000 };
    try{
      if(!el) return out;
      var raw = el.textContent || el.innerText || '[]';
      var data = JSON.parse(raw);
      if (Object.prototype.toString.call(data) === '[object Array]'){
        out.slides = data;
      } else {
        out.video    = data.video || null;
        out.slides   = data.slides || [];
        out.interval = data.interval || 4000;
      }
    }catch(_){}
    return out;
  }

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }
  function showVideo(src, done){
    stage.innerHTML =
      '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if(!v){ if(done) done(); return; }
    v.addEventListener('ended', function(){ if(done) done(); });
    v.addEventListener('error', function(){ if(done) done(); });
  }

  var c = cfg();
  var i = 0;
  function rotate(){
    if (!c.slides || !c.slides.length) return;
    showImg(c.slides[i]);
    i = (i + 1) % c.slides.length;
    setTimeout(rotate, c.interval);
  }

  if (c.video) showVideo(c.video, rotate);
  else rotate();
})();