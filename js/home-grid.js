/* global Promise, IntersectionObserver */
/* Home grid (ES5) — infinite scroll that works from / and /work/
   + robust image fallbacks so each card reliably shows a 16:9 cover
*/
(function () {
  var PAGE = 12;

  // expose a single fallback helper (used by <img onerror>)
  if (!window.sedNextSrc) {
    window.sedNextSrc = function (img) {
      try {
        var raw = img.getAttribute('data-srcs') || '';
        var list = raw ? raw.split('|') : [];
        if (!list.length) return; // final attempt already placeholder
        var next = list.shift();
        img.setAttribute('data-srcs', list.join('|'));
        img.src = next;
      } catch (e) { /* no-op */ }
    };
  }

  // find grid + its scroller
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

  // normalize a path to absolute “/assets/…” unless it’s already http(s)
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    // remove leading "./"
    p = String(p).replace(/^(\.\/)+/, '');
    // ensure single leading slash (for Cloudflare Pages root)
    return '/' + p.replace(/^\/+/, '');
  }

  // build the list of candidate URLs for an item’s cover
  function coverCandidates(it){
    var list = [];
    if (it.cover) list.push(abs(it.cover));
    if (it.slug) {
      // conventional locations in both absolute and relative forms
      list.push(abs('assets/work/' + it.slug + '/cover.jpg'));
      list.push('assets/work/' + it.slug + '/cover.jpg');  // relative (works from /)
      list.push('../assets/work/' + it.slug + '/cover.jpg'); // relative (works from /work/)
    }
    // final guaranteed placeholder (absolute)
    list.push(abs('assets/work/placeholder-16x9.jpg'));
    // de-dupe while keeping order
    var seen = {};
    var out = [];
    for (var i=0;i<list.length;i++){
      var u = list[i];
      if (!u || seen[u]) continue;
      seen[u] = 1;
      out.push(u);
    }
    return out;
  }

  // one card
  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var srcs  = coverCandidates(it);
    var first = srcs.shift();

    // your project route uses /project?slug=...
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    // NOTE: we store remaining fallbacks on data-srcs and let onerror rotate
    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + first + '" alt="" ' +
                 'data-srcs="' + srcs.join('|') + '" ' +
                 'onerror="window.sedNextSrc && window.sedNextSrc(this)">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  // placeholders (only used if work.json can’t be loaded)
  function placeholders(n){
    var out = [];
    for (var i = 0; i < n; i++){
      out.push({
        slug: 'ph-' + (i + 1),
        title: 'Project ' + (i + 1),
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg',
        href: '#'
      });
    }
    return out;
  }

  // load assets/work.json from several bases so it works on / and /work/
  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) {
        return Promise.resolve(placeholders(24));
      }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now(); // cache-bust
      return fetch(url, { cache: 'no-store' })
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .then(function (d){ if (Array.isArray(d) && d.length) return d; throw 0; })
        .catch(function (){ return tryNext(); });
    }
    return tryNext();
  }

  // state + render
  var items=[], cursor=0, loading=false, done=false, added={};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length), html='';
    for (var i=cursor; i<end; i++){
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
    var roots = [scroller, document.documentElement];
    var scrollable = roots.some(function(root){
      if(!root) return false;
      return root.scrollHeight > root.clientHeight + 8;
    });
    if (!scrollable && !done) renderMore();
  }

  function makeSentinel(where){
    var s = document.createElement('div');
    s.className = 'grid-sentinel';
    s.style.cssText = 'height:1px;width:100%';
    where.appendChild(s);
    return s;
  }

  var s1 = scroller ? makeSentinel(scroller) : null;
  var section = grid.closest ? grid.closest('.section') : null;
  var after = (section && section.parentNode) ? section.parentNode : document.body;
  var s2 = makeSentinel(after);

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

    // pad if your real list is short so there’s something to scroll
    if (items.length < 30){
      var need = 30 - items.length;
      var base = items.length;
      for (var i=0;i<need;i++){
        items.push({
          slug:'ph-'+(base+i+1),
          title:'Project '+(base+i+1),
          client:'ABC News', year:'—', role:'Production Designer',
          cover:'assets/work/placeholder-16x9.jpg', href:'#'
        });
      }
    }

    cursor = 0; loading = false; done = false; added = {};
    renderMore();
    if (s1) observe(scroller, s1);
    if (s2) observe(null, s2);
  });
})();