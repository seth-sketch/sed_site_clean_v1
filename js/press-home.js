(function(){
  var list = document.getElementById('pressList');
  if (!list) return;

  function fmt(d){
    if (!d) return '';
    var m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var mm = parseInt((d.split('-')[1]||''),10), yyyy = (d.split('-')[0]||'').trim();
    return (m[mm-1] || '') + (yyyy ? ' ' + yyyy : '');
  }

  fetch('assets/press.json?v='+Date.now(), { cache:'no-store' })
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(items){
      if (!Array.isArray(items) || !items.length) return;
      items.sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); });
      var top = items.slice(0, 6);
      list.innerHTML = top.map(function(it){
        var meta = [];
        if (it.source) meta.push(it.source);
        if (it.date)   meta.push(fmt(it.date));
        return '<li><a href="'+it.url+'" target="_blank" rel="noopener">'+
                 (it.title || 'Article') +
               '</a>' + (meta.length ? ' · <span class="meta">'+meta.join(' · ')+'</span>' : '') +
               '</li>';
      }).join('');
    })
    .catch(function(){});
})();