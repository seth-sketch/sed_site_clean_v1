/* Full press page renderer */
(function(){
  var list = document.getElementById('pressList');
  if (!list) return;
  fetch('/assets/press.json?v=' + Date.now(), { cache:'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(items){
      if (!Array.isArray(items)) return;
      var html = '';
      for (var i=0;i<items.length;i++){
        var it = items[i];
        html += '<li><a class="press-card" href="'+it.url+'" target="_blank" rel="noopener">' +
                  '<div class="thumb"><span class="ratio-169"><img src="'+(it.thumb||'/assets/press/wnt-thumb.jpg')+'" alt=""></span></div>' +
                  '<div><div class="title"><strong>'+it.title+'</strong></div>' +
                  '<div class="meta">'+(it.source||'')+(it.date? ' · ' + it.date : '')+'</div></div>' +
                '</a></li>';
      }
      list.innerHTML = html;
    });
})();