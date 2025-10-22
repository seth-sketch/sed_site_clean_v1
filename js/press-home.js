/* Home press teaser (ES5): shows up to 6 items from assets/press.json */
(function(){
  var root = document.getElementById('pressHome');
  if (!root) return;

  function load(done){
    var url = '/assets/press.json?v=' + (new Date().getTime());
    fetch(url, { cache:'no-store' })
      .then(function(r){ if (!r.ok) throw 0; return r.json(); })
      .then(function(j){ done(Array.isArray(j) ? j : []); })
      .catch(function(){ done([]); });
  }

  function itemHTML(it){
    var t = it.title || 'Article';
    var s = it.source || '';
    var d = it.date || '';
    var u = it.url || '#';
    var th = it.thumb || '/assets/press/placeholder-16x9.jpg';
    var meta = [s,d].filter(Boolean).join(' · ');
    return ''+
      '<li class="press-item">'+
        '<a class="thumb" href="'+u+'" target="_blank" rel="noopener">'+
          '<span class="ratio-169"><img src="'+th+'" alt=""></span>'+
        '</a>'+
        '<div class="text">'+
          '<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'+
          (meta ? '<div class="meta">'+meta+'</div>' : '')+
        '</div>'+
      '</li>';
  }

  load(function(list){
    var top = list.slice(0, 6);
    root.innerHTML = top.map(itemHTML).join('');
  });
})();