/* Full press page list */
(function(){
  var listEl = document.getElementById('pressAll');
  if (!listEl) return;

  fetch('/assets/press.json?v=' + Date.now(), { cache:'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(items){
      if (!Array.isArray(items)) return;
      items.forEach(function(p){
        var thumb = p.thumb || '/assets/press/placeholder-16x9.jpg';
        var html = ''+
          '<li class="press-item">'+
            '<a class="thumb" href="'+p.url+'" target="_blank" rel="noopener">'+
              '<span class="ratio-169"><img src="'+thumb+'" alt=""></span>'+
            '</a>'+
            '<div>'+
              '<a href="'+p.url+'" target="_blank" rel="noopener">'+(p.title||'Article')+'</a>'+
              '<div class="meta">'+(p.source||'')+(p.date?(' · '+p.date):'')+'</div>'+
            '</div>'+
          '</li>';
        listEl.insertAdjacentHTML('beforeend', html);
      });
    });
})();