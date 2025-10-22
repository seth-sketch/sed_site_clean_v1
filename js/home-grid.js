/* home-grid.js — 16:9 covers with placeholder + infinite scroll */
(function () {
  var PAGE = 12;

  // find grid & its scroller
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

  // card HTML
  function esc(s){ return (s==null?'':String(s)); }
  function card(it){
    var title = esc(it.title||'Project');
    var meta  = [it.client, it.year, it.role].filter(Boolean).map(esc).join(' · ');
    var img   = it.cover || ('/assets/work/' + esc(it.slug||'x') + '/cover.jpg');
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="'+href+'">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="'+img+'" alt="" ' +
            ' onerror="this.onerror=null;this.src=\'/assets/work/placeholder-16x9.jpg\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+href+'">'+title+'</a>' +
          '<div class="meta">'+meta+'</div>' +
        '</div>' +
      '</article>';
  }

  // load work.json from a few bases so / and /work/ both work
  function loadJSON(cb){
    var bases = ['', './', '../', '/'];
    var i = 0;
    (function tryNext(){
      if (i >= bases.length){ cb([]); return; }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      fetch(url, { cache:'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(tryNext);
    })();
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

    // ensure something scrolls
    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  // sentinel inside the scroller
  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    (scroller || document.body).appendChild(sentinel);
  }

  var io = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin:'400px 0px', threshold:0.01 });

  loadJSON(function(list){
    items = Array.isArray(list) ? list : [];
    // pad if very short so it looks scrollable
    if (items.length < 18){
      var base = items.length;
      for (var k=0;k<18-base;k++){
        items.push({
          slug:'ph-'+(base+k+1),
          title:'Project '+(base+k+1),
          client:'', year:'', role:'',
          cover:'/assets/work/placeholder-16x9.jpg', href:'#'
        });
      }
    }
    cursor=0; loading=false; done=false; added={};
    renderMore();
    io.observe(sentinel);
  });
})();