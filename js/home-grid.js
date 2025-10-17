/* global Promise, IntersectionObserver */
(function () {
  var PAGE = 12;

  // Fallback rotator used by <img onerror>
  if (!window.sedNextSrc) {
    window.sedNextSrc = function (img) {
      var raw = img.getAttribute('data-srcs') || '';
      var list = raw ? raw.split('|') : [];
      if (!list.length) return;
      var next = list.shift();
      img.setAttribute('data-srcs', list.join('|'));
      img.src = next;
    };
  }

  // Find grid + its scrolling container
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

  // Make absolute /assets/... (so it works from / and /work/)
  function abs(p){
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    p = String(p).replace(/^(\.\/)+/, '');
    return '/' + p.replace(/^\/+/, '');
  }

  function coverCandidates(it){
    var out = [];
    if (it.cover) out.push(abs(it.cover));
    if (it.slug) {
      out.push(abs('assets/work/' + it.slug + '/cover.jpg'));     // absolute
      out.push('assets/work/' + it.slug + '/cover.jpg');          // relative
      out.push('../assets/work/' + it.slug + '/cover.jpg');       // relative (from /work/)
    }
    out.push(abs('assets/work/placeholder-16x9.jpg'));            // guaranteed final fallback

    // de-dupe
    var seen = {}, list = [];
    for (var i=0;i<out.length;i++){
      var u = out[i];
      if (!u || seen[u]) continue;
      seen[u] = 1;
      list.push(u);
    }
    return list;
  }

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var srcs  = coverCandidates(it);
    var first = srcs.shift();
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

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

  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }

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

    // If nothing scrolls yet, keep adding
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  function makeSentinel(where){
    var s = document.createElement('div');
    s.id = 'gridSentinel';
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

    // pad with placeholders so there’s always scroll room
    if (items.length < 30){
      var need = 30 - items.length, base = items.length;
      for (var i=0;i<need;i++){
        items.push({
          slug:'ph-'+(base+i+1),
          title:'Project '+(base+i+1),
          client:'ABC News', year:'—', role:'Production Designer',
          cover:'assets/work/placeholder-16x9.jpg', href:'#'
        });
      }
    }

    cursor=0; loading=false; done=false; added={};
    renderMore();
    if (s1) observe(scroller, s1);
    if (s2) observe(null, s2);
  });
})();