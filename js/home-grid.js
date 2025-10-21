/* Home/work grid (ES5): infinite scroll + solid cover fallback */
(function () {
  var PAGE = 12;

  var grid = document.getElementById('homeGrid') ||
             document.getElementById('workGrid');
  if (!grid) return;

  function findScroller(el){
    while (el && el !== document.body){
      if (el.classList && el.classList.contains('scroller')) return el;
      el = el.parentNode;
    }
    return null;
  }
  var scroller = findScroller(grid);

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || ('/assets/work/' + (it.slug || 'unknown') + '/cover.jpg');
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + img + '" alt="" ' +
                 'onerror="this.onerror=null;this.src=\'/assets/work/placeholder-16x9.jpg\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }

  var items=[], cursor=0, loading=false, done=false, seen={};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;
    var end = Math.min(cursor + PAGE, items.length), html = '';
    for (var k = cursor; k < end; k++){
      var it = items[k];
      if (!it || !it.slug || seen[it.slug]) continue;
      seen[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

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

  var io = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    cursor=0; loading=false; done=false; seen={};
    renderMore();
    io.observe(sentinel);
  });
})();