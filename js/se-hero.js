<script>
(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;

  var cfg = {
    slides: [
      "assets/hero/slide1.jpg",
      "assets/hero/slide2.jpg",
      "assets/hero/slide3.jpg"
    ],
    interval: 4000,
    video: null
  };

  function applyAndStart(c){
    if (c && c.slides && c.slides.length) cfg.slides = c.slides;
    if (c && c.interval) cfg.interval = c.interval;
    if (c && typeof c.video === "string") cfg.video = c.video;
    start();
  }

  function readInline(){
    var el = document.getElementById('seSlidesJSON');
    if (!el) return false;
    try {
      var raw = el.textContent || el.innerText || "{}";
      var parsed = JSON.parse(raw);
      applyAndStart(parsed);
      return true;
    } catch (e) {}
    return false;
  }

  function fetchFile(){
    var url = "/assets/hero/seSlides.json?v=" + Date.now(); // cache-bust
    fetch(url, { cache: "no-store" })
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .then(function(json){ applyAndStart(json); })
      .catch(function(){ start(); }); // fallback to defaults
  }

  function showImg(src){
    stage.innerHTML = '<span class="ratio-169"><img src="'+src+'" alt=""></span>';
  }

  function showVideo(src, onDone){
    stage.innerHTML = '<span class="ratio-169"><video src="'+src+'" muted playsinline autoplay></video></span>';
    var v = stage.querySelector('video');
    if (!v){ if (onDone) onDone(); return; }
    v.addEventListener('ended', function(){ if (onDone) onDone(); });
    v.addEventListener('error', function(){ if (onDone) onDone(); });
  }

  function start(){
    var i = 0;
    function rotate(){
      if (!cfg.slides || !cfg.slides.length) return;
      showImg(cfg.slides[i]);
      i = (i + 1) % cfg.slides.length;
      setTimeout(rotate, cfg.interval);
    }
    if (cfg.video) showVideo(cfg.video, rotate); else rotate();
  }

  if (!readInline()) fetchFile();
})();
</script>