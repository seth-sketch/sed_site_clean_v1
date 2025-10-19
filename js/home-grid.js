/* js/home-grid.js — ES5 infinite grid with 16:9 covers + fallbacks */
(function () {
  var PAGE = 12;

  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
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

  function esc(s){ return String(s || ''); }

  function card(it){
    var slug  = esc(it.slug);
    var cover = esc(it.cover || ('assets/work/' + slug + '/cover.jpg'));
    var href  = slug ? ('project.html?slug=' + encodeURIComponent(slug)) : esc(it.href || '#');
    var meta  = [it.client, it.year, it.role].filter(Boolean).map(esc).join(' · ');
    var title = esc(it.title || 'Project');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + cover + '" alt="" ' +
            'onerror="this.onerror=null;this.src=\'assets/work/placeholder-16x9.jpg\'">' +
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
    function next(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return next(); });
    }
    return next();
  }

  var items = [], cursor = 0, added = {}, done = false, busy = false;

  function renderMore(){
    if (busy || done || !items.length) return;
    busy = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++){
      var it = items[i];
      if (!it || !it.slug || added[it.slug]) continue;
      added[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    busy = false;

    // ensure there is something to scroll
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  var sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  (scroller || document.body).appendChild(sentinel);

  var io = new IntersectionObserver(function (entries) {
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    renderMore();
    io.observe(sentinel);
  });
})();