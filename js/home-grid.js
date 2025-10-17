/* global Promise, IntersectionObserver */
/* Home grid (ES5) — infinite scroll that works from / and /work/ */
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

  /* one card */
  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    // Prefer JSON cover; otherwise try /assets/work/<slug>/cover.jpg
    var fallback = it.slug ? ('assets/work/' + it.slug + '/cover.jpg') : 'assets/work/placeholder-16x9.jpg';
    var img = it.cover || fallback;
    var href = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug)) : (it.href || '#');

    // onerror uses single quotes; we escape them so the outer JS string stays valid
    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + img + '" alt="" ' +
            'onerror="this.onerror=null;this.src=\\\'/assets/work/placeholder-16x9.jpg\\\';">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  /* load JSON from robust set of bases */
  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function (){ return tryNext(); });
    }
    return tryNext();
  }

  /* state + render */
  var items = [], cursor = 0, loading = false, done = false, added = {};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

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
    loading = false;

    // If nothing scrolls yet, keep adding until it does
    var root = scroller || document.documentElement;
    var filled = root.scrollHeight > (root.clientHeight + 8);
    if (!filled && !done) renderMore();
  }

  function sentinel(where){
    var s = document.createElement('div');
    s.className = 'grid-sentinel';
    s.style.cssText = 'height:1px;width:100%';
    where.appendChild(s);
    return s;
  }

  var sInside = scroller ? sentinel(scroller) : null;
  var section = grid.closest ? grid.closest('.section') : null;
  var after = (section && section.parentNode) ? section.parentNode : document.body;
  var sPage = sentinel(after);

  function observe(root, target){
    var io = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root || null, rootMargin:'400px 0px', threshold:0.01 });
    io.observe(target);
    return io;
  }

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    cursor = 0; loading = false; done = false; added = {};
    renderMore();
    if (sInside) observe(scroller, sInside);
    observe(null, sPage);
  });
})();