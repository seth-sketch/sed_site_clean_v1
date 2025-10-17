/* Infinite Scroll Grid — ES5 only (no let/const, no arrows, no Set) */
(function () {
  var PAGE = 12;

  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
             document.getElementById('workGrid');
  if (!grid) return;

  function findScroller(el) {
    var n = el;
    while (n && n !== document.body) {
      if (n.classList && n.classList.contains('scroller')) return n;
      n = n.parentNode;
    }
    return null;
  }
  var scroller = findScroller(grid);

  // sentinel to trigger next batch
  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel) {
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    sentinel.style.width  = '100%';
    (grid.parentNode || document.body).appendChild(sentinel);
  }

  // ------- data + render state (ES5-safe) -------
  var items   = [];
  var cursor  = 0;
  var loading = false;
  var done    = false;
  var added   = Object.create(null); // use object as a set

  function cardHTML(it) {
    var title = it.title || 'Project';
    var metaParts = [];
    if (it.client) metaParts.push(it.client);
    if (it.year)   metaParts.push(it.year);
    if (it.role)   metaParts.push(it.role);
    var meta = metaParts.join(' · ');

    var img = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                       : (it.href || '#');

    var html = ''
      + '<article class="card">'
      +   '<a class="cover" href="' + href + '">'
      +     '<span class="ratio-169"><img loading="lazy" src="' + img + '" alt=""></span>'
      +   '</a>'
      +   '<div class="footer">'
      +     '<a href="' + href + '">' + title + '</a>'
      +     '<div class="meta">' + meta + '</div>'
      +   '</div>'
      + '</article>';
    return html;
  }

  function renderMore () {
    if (loading || done || !items.length) return;
    loading = true;

    var end  = Math.min(cursor + PAGE, items.length);
    var html = '';

    for (var i = cursor; i < end; i++) {
      var it = items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;      // de-dupe
      added[it.slug] = 1;
      html += cardHTML(it);
    }

    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;

    loading = false;

    // If container isn't actually filled yet, keep loading more
    var root   = scroller || document.documentElement;
    var filled = (root.scrollHeight > (root.clientHeight + 16));
    if (!filled && !done) renderMore();
  }

  // Observe the sentinel inside the scroller (or window)
  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        renderMore();
        break;
      }
    }
  }, {
    root: scroller || null,
    rootMargin: '300px 0px',
    threshold: 0.01
  });

  // ------- robust loader for assets/work.json (works from / and /work/) -------
  function loadJSON () {
    var bases = ['', './', '../', '/'];

    function placeholders(n) {
      var out = [];
      for (var i = 0; i < n; i++) {
        out.push({
          slug:  'placeholder-' + (i + 1),
          title: 'Project ' + (i + 1),
          client: 'ABC News',
          year:  '—',
          role:  'Production Designer',
          cover: 'assets/work/placeholder-16x9.jpg',
          href:  '#'
        });
      }
      return out;
    }

    function tryNext(i) {
      if (i >= bases.length) {
        return Promise.resolve(placeholders(24));
      }
      var url = bases[i] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r) {
          if (!r.ok) throw 0;
          return r.json();
        })
        .then(function (data) {
          if (Array.isArray(data) && data.length) return data;
          throw 0;
        })
        .catch(function () {
          return tryNext(i + 1);
        });
    }

    return tryNext(0);
  }

  // Kick off
  loadJSON().then(function (list) {
    items = list || [];
    renderMore();               // first page
    observer.observe(sentinel); // then infinite
  });
})();