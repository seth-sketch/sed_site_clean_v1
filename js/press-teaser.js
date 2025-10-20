(function(){
  var list = document.getElementById('pressList');
  if (!list) return;
  function row(p){
    var t = p.title || 'Press';
    var s = p.source || '';
    var d = p.date || '';
    var u = p.url || '#';
    var meta = (s||d) ? ' <span class="meta">(' + [s,d].filter(Boolean).join(' · ') + ')</span>' : '';
    return '<li><a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'+meta+'</li>';
  }
  var bases = ['', './', '../', '/']; var i=0;
  (function next(){
    if (i>=bases.length) return;
    var url = bases[i++] + 'assets/press.json?v=' + Date.now();
    fetch(url, {cache:'no-store'}).then(function(r){ return r.ok ? r.json() : []; })
      .then(function(rows){
        if (rows && rows.length){ list.innerHTML = rows.slice(0,8).map(row).join(''); }
        else { next(); }
      })
      .catch(function(){ next(); });
  })();
})();