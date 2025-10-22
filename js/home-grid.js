/* Home/work grid — infinite scroll + 16:9 cards (no Promise, no fetch) */
(function () {
  var grid = document.getElementById('homeGrid') ||
             document.getElementById('workGrid');
  if (!grid) return;

  var scroller = (function findScroller(el){
    while (el && el !== document.body){
      if (el.classList && el.classList.contains('scroller')) return el;
      el = el.parentNode;
    }
    return null;
  })(grid);

  var PAGE = 12, items = [], cursor = 0, loading = false, done = false;

  function card(it) {
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug)) : '#';
    return '' +
      '<article class="card">' +
        '<a class="cover" href="'+href+'">' +
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+href+'">'+title+'</a>' +
          '<div class="meta">'+meta+'</div>' +
        '</div>' +
      '</article>';
  }

  /* Promise-free JSON loader with XHR and multi-base fallback */
  function loadJSON(cb){
    var bases = ['', './', '../', '/'], i = 0;

    function tryNext(){
      if (i >= bases.length){ cb([]); return; }
      var url = bases[i++] + 'assets/work.json?v=' + (+new Date());
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.onreadystatechange = function(){
        if (x.readyState !== 4) return;
        if (x.status >= 200 && x.status < 300){
          try {
            var data = JSON.parse(x.responseText);
            if (data && data.length){ cb(data); return; }
          } catch(_) {}
        }
        tryNext();
      };
      x.onerror = tryNext;
      x.send();
    }
    tryNext();
  }

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var j = cursor; j < end; j++) html += card(items[j]);
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    // If there’s still no scroll area, keep filling
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    (scroller || document.body).appendChild(sentinel);
  }

  var io = new IntersectionObserver(function (entries) {
    for (var k=0;k<entries.length;k++){
      if (entries[k].isIntersecting){ renderMore(); break; }
    }
  }, { root: scroller || null, rootMargin:'400px 0px', threshold:0.01 });
  io.observe(sentinel);

  loadJSON(function(list){ items = list || []; renderMore(); });
})();