/* global Promise */
/* Home grid (ES5) — infinite scroll inside .scroller.
   - Works from / and /work/ (tries several JSON paths)
   - Auto-fills until the scroller has content to scroll
   - Links to project.html?slug=<slug>
*/
(function () {
  var PAGE = 12;

  // Find the grid and its scroller
  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
             document.getElementById('workGrid');
  if (!grid) { return; }

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

  // Card HTML
  function cardHTML(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169"><img loading="lazy" src="' + img + '" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  // Robust loader: try several bases so it works from / and /work/
  function placeholders(n){
    var out = [];
    for (var i = 0; i < n; i++){
      out.push({
        slug: 'placeholder-' + (i+1),
        title: 'Project ' + (i+1),
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg',
        href: '#'
      });
    }
    return out;
  }

  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext() {
      if (i >= bases.length) {
        return Promise.resolve(placeholders(24)); // <— Promise spelled exactly
      }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
          if (Array.isArray(data) && data.length) return data;
          throw 0;
        })
        .catch(function () { return tryNext(); });
    }
    return tryNext();
  }

  // State
  var items = [];
  var cursor = 0;
  var loading = false;
  var done = false;
  var added = {}; // de-dupe by slug

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++){
      var it = items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;
      added[it.slug] = 1;
      html += cardHTML(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;

    loading = false;

    // If the scroller (or window) isn't tall enough to scroll yet, keep adding
    var root = scroller || document.documentElement;
    var filled = root.scrollHeight > root.clientHeight + 16;
    if (!filled && !done) renderMore();
  }

  // Sentinel AFTER the grid INSIDE the scroller (or body if no scroller)
  var sentinel = document.createElement('div');
  sentinel.id = 'gridSentinel';
  sentinel.style.height = '1px';
  if (scroller) { scroller.appendChild(sentinel); }
  else { document.body.appendChild(sentinel); }

  // Observe
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++){
      if (entries[i].isIntersecting) {
        renderMore();
      }
    }
  }, {
    root: scroller || null,
    rootMargin: '400px 0px',
    threshold: 0.01
  });

  // Kick off
  loadJSON().then(function (list) {
    items = Array.isArray(list) ? list : [];
    cursor = 0;
    loading = false;
    done = false;
    added = {};
    renderMore();               // first page
    observer.observe(sentinel); // then infinite
  });
})();