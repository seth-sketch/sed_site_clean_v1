/* Home grid (ES5) — infinite scroll inside .scroller. Works from / and /work/ */
(function () {
  var PAGE = 12;

  // Find the grid and its scroller
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

  // Card HTML
  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + img + '" alt="" ' +
              'onerror="this.onerror=null;this.src=\'assets/work/placeholder-16x9.jpg\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  // Load JSON from several bases so it works from / and /work/
  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) {
        // fallback placeholders so layout still works
        var ph = [];
        for (var n=0;n<24;n++){
          ph.push({
            slug:'ph-'+(n+1), title:'Project '+(n+1),
            client:'ABC News', year:'—', role:'Production Designer',
            cover:'assets/work/placeholder-16x9.jpg', href:'#'
          });
        }
        return Promise.resolve(ph);
      }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .then(function (d){ if (Array.isArray(d) && d.length) return d; throw 0; })
        .catch(function (){ return tryNext(); });
    }
    return tryNext();
  }

  // State + render
  var items=[], cursor=0, loading=false, done=false, added={};

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

    // If the scroller or page isn't tall enough yet, add more
    var roots = [scroller, document.documentElement];
    var scrollable = roots.some(function(root){
      if(!root) return false;
      return root.scrollHeight > root.clientHeight + 8;
    });
    if (!scrollable && !done) renderMore();
  }

  // Sentinel(s)
  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    (scroller || document.body).appendChild(sentinel);
  }

  var observer = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });

  // Kick off
  loadJSON().then(function (list) {
    items = Array.isArray(list) ? list : [];
    cursor = 0; loading = false; done = false; added = {};
    renderMore();               // first page
    observer.observe(sentinel); // then infinite
  });
})();