/* simple press renderer from /assets/press.json */
(function(){
  var grid = document.getElementById('pressGrid');
  if (!grid) return;

  function card(p){
    var img = p.thumb || '/assets/press/wnt-thumb.jpg'; // fallback if you have one
    return '' +
      '<article class="card">' +
        '<a class="cover" href="'+p.url+'" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+p.url+'" target="_blank" rel="noopener">'+p.title+'</a>' +
          '<div class="meta">'+(p.source||'')+' · '+(p.date||'')+'</div>' +
        '</div>' +
      '</article>';
  }

  fetch('/assets/press.json', { cache:'no-store' })
    .then(function(r){ return r.json(); })
    .then(function(list){
      if (!Array.isArray(list) || !list.length) return;
      grid.innerHTML = list.map(card).join('');
    });
})();