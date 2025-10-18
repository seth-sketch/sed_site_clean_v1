
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

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' \u00B7 ');
    var primary = it.cover || ('assets/work/' + (it.slug || 'unknown') + '/cover.jpg');
    var href    = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                          : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + primary + '" alt="" ' +
                 'onerror="this.onerror=null;this.src=\\'assets/work/placeholder-16x9.jpg\\'">' +
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
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function (){ return tryNext(); });
    }
    return tryNext();
  }

  var items=[], cursor=0, loading=false, done=false, added={};

  function renderMore(){
    if (loading || done) return;
    loading = true;
    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++){
      var it = items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;
      added[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done){
      renderMore();
    }
  }

  function observeIO(target, root){
    if (!('IntersectionObserver' in window)){
      var ticking = false;
      function onScroll(){
        if (ticking) return;
        ticking = true;
        setTimeout(function(){
          ticking = false;
          var rootEl = root || document.documentElement;
          if (rootEl.scrollTop + rootEl.clientHeight + 400 >= rootEl.scrollHeight){
            renderMore();
          }
        }, 200);
      }
      (root || window).addEventListener('scroll', onScroll);
      return;
    }
    var io = new IntersectionObserver(function (entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root || null, rootMargin: '400px 0px', threshold: 0.01 });
    io.observe(target);
  }

  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    if (scroller) scroller.appendChild(sentinel);
    else document.body.appendChild(sentinel);
  }

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    if (!items.length){
      for (var k=1;k<=24;k++){
        items.push({
          slug:'placeholder-'+k,
          title:'Project '+k,
          client:'ABC News',
          year:'—',
          role:'Production Designer',
          cover:'assets/work/placeholder-16x9.jpg',
          href:'#'
        });
      }
    }
    cursor=0; loading=false; done=false; added={};
    renderMore();
    observeIO(sentinel, scroller);
  });
})();
