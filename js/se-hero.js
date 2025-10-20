(function(){
  var stage = document.getElementById('heroStage');
  var jsonEl = document.getElementById('seSlidesJSON');
  if (!stage || !jsonEl) return;
  var slides = [];
  try { slides = JSON.parse(jsonEl.textContent || '[]'); } catch(e){ slides = []; }
  if (!slides.length) return;
  var i = 0;
  function render(s){
    if (typeof s === 'string') s = { type:'image', src:s };
    if (!s.type) s.type = 'image';
    if (s.type === 'video'){
      var attrs = ['playsinline','autoplay','muted','loop'].join(' ');
      var poster = s.poster ? ' poster="'+s.poster+'"' : '';
      stage.innerHTML = '<video '+attrs+poster+' style="width:100%;height:100%;object-fit:cover"><source src="'+s.src+'"></video>';
      var v = stage.querySelector('video'); if (v) { try{ v.play(); }catch(_){ } }
    } else {
      stage.innerHTML = '<img src="'+s.src+'" alt="" style="width:100%;height:100%;object-fit:cover">';
    }
  }
  function next(){ i = (i + 1) % slides.length; render(slides[i]); }
  render(slides[0]);
  setInterval(next, 4000);
})();