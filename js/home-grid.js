/* global IntersectionObserver */
/* Home grid — infinite scroll from assets/work.json (unique by slug, 16:9 covers) */
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

  function cardHTML(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug)) : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169"><img loading="lazy" decoding="async" src="' + img + '" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  function loadWorkJSON(){
    // Try relative bases so it works on / and /work/
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]); // no placeholders
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function (){ return tryNext(); });
    }
    return tryNext().then(function(arr){
      // Deduplicate by slug, keep first
      var seen = {};
      var out = [];
      if (arr && arr.length){
        for (var k=0;k<arr.length;k++){
          var it = arr[k]; if (!it || !it.slug) continue;
          if (seen[it.slug]) continue;
          seen[it.slug] = 1;
          out.push(it);
        }
      }
      return out;
    });
  }

  var items=[], cursor=0, loading=false, done=false, added={};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length), html='';
    for (var i=cursor;i<end;i++){
      var it=items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;
      added[it.slug]=1;
      html += cardHTML(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor=end; if (cursor>=items.length) done=true;
    loading=false;
  }

  var sentinel = document.createElement('div');
  sentinel.id = 'gridSentinel';
  sentinel.style.cssText = 'height:1px;width:100%';
  (scroller || grid.parentNode || document.body).appendChild(sentinel);

  var io = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin: '400px 0px', threshold: 0.01 });

  loadWorkJSON().then(function(list){
    items = list || [];
    cursor=0; loading=false; done=false; added={};
    grid.innerHTML='';
    renderMore();
    io.observe(sentinel);
  });
})();