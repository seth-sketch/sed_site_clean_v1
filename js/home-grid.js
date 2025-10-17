/* Home grid (ES5) — infinite scroll that works from / and /work/ */
(function () {
  var PAGE = 12;

  // Find the grid and its scroller
  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
             document.getElementById('workGrid');
  if (!grid) return;

  function findScroller(el){
    var n = el;
    while (n && n !== document.body){
      if (n.classList && n.classList.contains('scroller')) return n;
      n = n.parentNode;
    }
    return null;
  }
  var scroller = findScroller(grid);

  // Clean start
  grid.innerHTML = '';

  // Helpers
  function esc(s){ return s == null ? '' : String(s); }
  function coverFor(it){
    if (it && it.cover) return it.cover;
    if (it && it.slug)  return 'assets/work/' + it.slug + '/cover.jpg';
    return 'assets/work/placeholder-16x9.jpg';
  }

  function card(it){
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');
    var title = esc(it.title || 'Project');
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = coverFor(it);

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + img + '" alt="" ' +
            "onerror=\"this.onerror=null;this.src='assets/work/placeholder-16x9.jpg'\">" +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + esc(meta) + '</div>' +
        '</div>' +
      '</article>';
  }

  // Load JSON robustly (works from / and /work/)
  function loadJSON(cb){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function next(){
      if (i >= bases.length) { cb([]); return; }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      fetch(url, { cache: 'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .then(function(data){
          if (data && data.length) cb(data);
          else next();
        })
        .catch(next);
    }
    next();
  }

  // State + render
  var items = [], cursor = 0, loading = false, done = false;

  function renderMore(){
    if (loading || done) return;
    loading = true;

    if (!items.length){ loading = false; return; }

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++){
      var it = items[i];
      if (!it || !it.slug) continue;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);

    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    // If nothing scrolls yet, keep adding until it does
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 16 && !done) renderMore();
  }

  // Sentinel inside the scroller (or body if no scroller)
  var sentinel = document.createElement('div');
  sentinel.id = 'gridSentinel';
  sentinel.style.height = '1px';
  (scroller || document.body).appendChild(sentinel);

  var observer = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });

  loadJSON(function(list){
    items = Array.isArray(list) ? list : [];
    cursor = 0; loading = false; done = false;
    renderMore();               // first page
    observer.observe(sentinel); // then infinite
  });
})();