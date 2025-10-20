(function(){
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

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug)) :
                          (it.href || '#');
    return ''+
      '<article class="card">'+
        '<a class="cover" href="'+href+'">'+
          '<span class="ratio-169">'+
            '<img loading="lazy" decoding="async" src="'+img+'" alt="" '+
              'onerror="this.onerror=null;this.src=\'assets/work/placeholder-16x9.jpg\'">'+
          '</span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+href+'">'+title+'</a>'+
          '<div class="meta">'+meta+'</div>'+
        '</div>'+
      '</article>';
  }

  function placeholders(n){
    var out = [];
    for (var i=0;i<n;i++){
      out.push({slug:'ph-'+(i+1),title:'Project '+(i+1),client:'ABC News',year:'—',role:'Production Designer',cover:'assets/work/placeholder-16x9.jpg',href:'#'});
    }
    return out;
  }

  function loadJSON(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve(placeholders(24));
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .then(function(d){ if (Array.isArray(d) && d.length) return d; throw 0; })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }

  var items=[], cursor=0, loading=false, done=false, added={};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;
    var end = Math.min(cursor + PAGE, items.length), html='';
    for (var i=cursor;i<end;i++){
      var it = items[i];
      if (!it || !it.slug || added[it.slug]) continue;
      added[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  function sentinelIn(where){
    var s = document.createElement('div');
    s.id = 'gridSentinel';
    s.style.height='1px'; s.style.width='100%';
    where.appendChild(s);
    return s;
  }
  var sentinel = scroller ? sentinelIn(scroller) : sentinelIn(document.body);

  var io = new IntersectionObserver(function(entries){
    for (var i=0;i<entries.length;i++){
      if (entries[i].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin:'400px 0px', threshold:0.01 });

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : placeholders(24);
    cursor=0; loading=false; done=false; added={};
    renderMore();
    io.observe(sentinel);
  });
})();
