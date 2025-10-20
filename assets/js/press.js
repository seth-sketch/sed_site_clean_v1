(function(){
  var wrap = document.getElementById('pressGrid');
  if (!wrap) return;
  function loadJSON(){
    var bases = ['', './', '../', '/']; var i=0;
    function tryNext(){
      if (i>=bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/press.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }
  function card(it){
    var t = it.title || 'Press item';
    var s = it.source || '';
    var d = it.date || '';
    var u = it.url || '#';
    var img = it.thumb || 'assets/work/placeholder-16x9.jpg';
    return ''+
      '<article class="press-card">'+
        '<img src="'+img+'" alt="">'+
        '<div>'+
          '<a href="'+u+'" target="_blank" rel="noopener"><strong>'+t+'</strong></a>'+
          '<div class="meta">'+s+(d?(' — '+d):'')+'</div>'+
        '</div>'+
      '</article>';
  }
  loadJSON().then(function(list){
    if (!list || !list.length){ wrap.innerHTML = '<p class="meta">No press yet.</p>'; return; }
    var html = ''; for (var i=0;i<list.length;i++) html += card(list[i]);
    wrap.innerHTML = html;
  });
})();
