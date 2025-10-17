/* home-grid.js — simple “render all” version */
(function () {
  var GRID = document.getElementById('homeGrid');
  var SCROLLER = document.getElementById('workScroller');
  if (!GRID || !SCROLLER) return;

  function placeholders(n) {
    var arr = [];
    for (var i = 1; i <= n; i++) {
      arr.push({
        slug: 'placeholder-' + i,
        title: 'Project ' + i,
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg'
      });
    }
    return arr;
  }

  function cardHTML(item) {
    var href  = item.slug.indexOf('placeholder-') === 0 ? '#' : ('work/' + item.slug + '.html');
    var meta  = [item.client, item.year, item.role].filter(Boolean).join(' · ');
    var cover = item.cover || ('assets/work/' + item.slug + '/cover.jpg');
    return ''
      + '<article class="card">'
      +   '<a class="cover" href="' + href + '">'
      +     '<span class="ratio-169">'
      +       '<img loading="lazy" src="' + cover + '" alt="" '
      +             'onerror="this.onerror=null;this.src=\'assets/work/placeholder-16x9.jpg\'">'
      +     '</span>'
      +   '</a>'
      +   '<div class="footer">'
      +     '<a href="' + href + '">' + item.title + '</a>'
      +     '<div class="meta">' + meta + '</div>'
      +   '</div>'
      + '</article>';
  }

  function render(list) {
    GRID.innerHTML = list.map(cardHTML).join('');
  }

  function loadJSON(paths, done) {
    var i = 0;
    (function next() {
      if (i >= paths.length) return done(null);
      var url = paths[i++] + '?v=' + Date.now();
      fetch(url, { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { done(Array.isArray(d) ? d : (d && d.projects) || null); })
        .catch(next);
    })();
  }

  loadJSON([
    'assets/work.json',
    '/assets/work.json',
    './assets/work.json',
    'work.json'
  ], function (data) {
    render(data && data.length ? data : placeholders(24));
  });
})();