/* /js/home-grid.js — 16:9 cards + infinite scroll. ES5, absolute paths. */
(function () {
  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
             document.getElementById('workGrid');
  var scroller = document.getElementById('workScroller') || null;
  if (!grid) return;

  grid.innerHTML = '';

  var items = [], cursor = 0, page = 12, loading = false, done = false, added = {};

  function card(it) {
    var slug  = it.slug || '';
    var href  = '/project?slug=' + encodeURIComponent(slug);
    var cover = it.cover || ('/assets/work/' + slug + '/cover.jpg');

    var html  = '';
    html += '<article class="card">';
    html += '  <a class="cover" href="' + href + '">';
    html += '    <span class="ratio-169">';
    html += '      <img loading="lazy" src="' + cover + '"';
    html += '           onerror="this.onerror=null;this.src=\'/assets/work/placeholder-16x9.jpg\'" alt="">';
    html += '    </span>';
    html += '  </a>';
    html += '  <div class="footer">';
    html += '    <a href="' + href + '">' + (it.title || 'Project') + '</a>';
    html += '    <div class="meta">' + [it.client, it.year, it.role].filter(Boolean).join(' · ') + '</div>';
    html += '  </div>';
    html += '</article>';
    return html;
  }

  function render() {
    if (loading || done) return;
    loading = true;

    var end = Math.min(cursor + page, items.length);
    var html = '';
    for (var i = cursor; i < end; i++) {
      var it = items[i];
      if (!it || !it.slug || added[it.slug]) continue;
      added[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    // Auto-fill until something scrolls
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) render();
  }

  function observe() {
    var sentinel = document.getElementById('gridSentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'gridSentinel';
      sentinel.style.height = '1px';
      (scroller || document.body).appendChild(sentinel);
    }
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) render();
      }
    }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });
    io.observe(sentinel);
  }

  function load() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/work.json?' + Date.now(), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { items = JSON.parse(xhr.responseText) || []; } catch (e) { items = []; }
          cursor = 0; added = {}; done = false;
          render();
          observe();
        }
      }
    };
    xhr.send();
  }

  load();
})();