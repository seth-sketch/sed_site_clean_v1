/* home-grid.js – single source of truth for the home work grid */
(function () {
  var GRID = document.getElementById('homeGrid');
  var SCROLLER = document.getElementById('workScroller');
  if (!GRID || !SCROLLER) return;

  GRID.innerHTML = '';

  // make sure we have a sentinel inside the scroller
  var SENTINEL = document.getElementById('gridSentinel');
  if (!SENTINEL) {
    SENTINEL = document.createElement('div');
    SENTINEL.id = 'gridSentinel';
    SENTINEL.style.height = '1px';
    SCROLLER.appendChild(SENTINEL);
  }

  var state = {
    data: [],
    added: Object.create(null), // de-dupe without Set()
    index: 0,
    pageSize: 9
  };

  function seen(slug) {
    if (state.added[slug]) return true;
    state.added[slug] = 1;
    return false;
  }

  function cardHTML(item) {
    var href  = 'work/' + item.slug + '.html';
    var cover = item.cover || ('assets/work/' + item.slug + '/cover.jpg');
    var meta  = [item.client, item.year, item.role].filter(Boolean).join(' · ');
    return ''
      + '<article class="card">'
      +   '<a class="cover" href="' + href + '">'
      +     '<span class="ratio-169"><img loading="lazy" src="' + cover + '" alt=""></span>'
      +   '</a>'
      +   '<div class="footer">'
      +     '<a href="' + href + '">' + item.title + '</a>'
      +     '<div class="meta">' + meta + '</div>'
      +   '</div>'
      + '</article>';
  }

  function renderNextPage() {
    if (!state.data.length) return;
    var end  = Math.min(state.index + state.pageSize, state.data.length);
    var html = '';
    for (var i = state.index; i < end; i++) {
      var it = state.data[i];
      if (!it || !it.slug || seen(it.slug)) continue;
      html += cardHTML(it);
    }
    if (html) GRID.insertAdjacentHTML('beforeend', html);
    state.index = end;
    if (state.index >= state.data.length && io) io.disconnect();
  }

  // Try several paths for work.json to avoid path/caching issues
  function loadWorkJSON(cb) {
    var paths = ['assets/work.json','/assets/work.json','./assets/work.json','work.json'];
    var i = 0;
    function next() {
      if (i >= paths.length) return cb(null);
      var url = paths[i++] + '?v=' + Date.now();
      fetch(url, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) {
          if (Object.prototype.toString.call(d) === '[object Array]' && d.length) cb(d);
          else next();
        })
        .catch(function () { next(); });
    }
    next();
  }

  function placeholders() {
    var arr = [];
    for (var n = 1; n <= 24; n++) {
      arr.push({
        slug: 'placeholder-' + n,
        title: 'Project ' + n,
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg',
        href: '#'
      });
    }
    return arr;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) { renderNextPage(); break; }
    }
  }, { root: SCROLLER, threshold: 0.01, rootMargin: '400px 0px 400px 0px' });

  io.observe(SENTINEL);

  loadWorkJSON(function (data) {
    state.data  = (data && data.length) ? data : placeholders();
    state.index = 0;
    state.added = Object.create(null);
    renderNextPage();
  });
})();