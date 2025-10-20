(function(){
  var grid = document.getElementById('pressGrid');
  if (!grid) return;

  function esc(s){ return String(s||''); }

  function card(it){
    var thumb = esc(it.thumb || '../assets/work/placeholder-16x9.jpg');
    var title = esc(it.title || 'Article');
    var meta = [esc(it.source||''), esc(it.date||'')].filter(Boolean).join(' · ');
    return '' +
      '<a class="press-card" href="'+esc(it.url)+'" target="_blank" rel="noopener">' +
        '<div class="thumb"><span class="ratio-169">' +
          '<img loading="lazy" decoding="async" src="'+thumb+'" alt="">' +
        '</span></div>' +
        '<div class="info">' +
          '<h3>'+ title +'</h3>' +
          (meta ? '<div class="meta">'+meta+'</div>' : '') +
        '</div>' +
      '</a>';
  }

  fetch('../assets/press.json?v='+Date.now(), { cache:'no-store' })
    .then(function(r){ if(!r.ok) throw 0; return r.json(); })
    .then(function(items){
      if (!Array.isArray(items) || !items.length) return;
      items.sort(function(a,b){ return String(b.date||'').localeCompare(String(a.date||'')); });
      grid.innerHTML = items.map(card).join('');
    })
    .catch(function(){});
})();