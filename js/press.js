/* Press page renderer (ES5) */
(function () {
  var grid = document.getElementById('pressGrid');
  if (!grid) return;

  function guessIcon(url){
    try {
      var a = document.createElement('a'); a.href = url;
      var domain = a.hostname || '';
      if (domain) return 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=128';
    } catch (e) {}
    return '../assets/work/placeholder-16x9.jpg';
  }

  function card(it){
    var href = it.url || '#';
    var title = it.title || 'Article';
    var src = it.image || guessIcon(href);
    var meta = [it.source, it.date].filter(Boolean).join(' · ');
    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img loading="lazy" src="' + src + '" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '" target="_blank" rel="noopener">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  function loadJSON(){
    var tries = [
      '../assets/press.json?v=' + Date.now(),
      '../js/press.json?v=' + Date.now(),
      '/assets/press.json?v=' + Date.now()
    ];
    var i = 0;
    function next(){
      if (i >= tries.length) return Promise.resolve([]);
      return fetch(tries[i++], { cache: 'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .catch(function(){ return next(); });
    }
    return next();
  }

  loadJSON().then(function(list){
    if (!list || !list.length) {
      grid.innerHTML = '<p class="meta">No press items found. Add items to <code>assets/press.json</code>.</p>';
      return;
    }
    var html = '';
    for (var i=0;i<list.length;i++) html += card(list[i]);
    grid.innerHTML = html;
  });
})();