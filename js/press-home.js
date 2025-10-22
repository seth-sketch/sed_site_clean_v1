/* Home press teaser — render first few items from /assets/press.json */
(function(){
  var host = document.getElementById('pressHome');
  if (!host) return;
  fetch('/assets/press.json?v=' + Date.now(), { cache:'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(items){
      if (!Array.isArray(items)) return;
      var take = Math.min(items.length, 6);
      var html = '';
      for (var i=0;i<take;i++){
        var it = items[i];
        html += '<div class="press-item">' +
                  '<img src="'+(it.thumb || '/assets/press/wnt-thumb.jpg')+'" alt="" width="36" height="36">' +
                  '<div><a href="'+it.url+'" target="_blank" rel="noopener">'+it.title+'</a>' +
                  '<div class="meta">'+(it.source || '')+'</div></div>' +
                '</div>';
      }
      host.innerHTML = html;
    });
})();