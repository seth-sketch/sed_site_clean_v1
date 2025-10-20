(function(){
  var stage = document.getElementById('heroStage');
  if (!stage) return;
  function isVideo(src){ return /\.(mp4|webm|ogg|ogv|mov)$/i.test(src); }
  var data = [];
  try{
    var raw = document.getElementById('seSlidesJSON');
    if (raw) data = JSON.parse(raw.textContent || "[]");
  }catch(e){ data = []; }
  if (!Array.isArray(data) || !data.length){
    data = ["assets/hero/slide1.jpg","assets/hero/slide2.jpg","assets/hero/slide3.jpg"];
  }
  var i = 0;
  function render(){
    var src = data[i];
    i = (i + 1) % data.length;
    if (typeof src === "object" && src.src) src = src.src;
    if (isVideo(src)){
      stage.innerHTML = '<video autoplay muted loop playsinline preload="auto">' +
                        '<source src="'+src+'" type="video/mp4">' +
                        '</video>';
    }else{
      stage.innerHTML = '<img src="'+src+'" alt="">';
    }
  }
  render();
  setInterval(render, 4000);
})();
