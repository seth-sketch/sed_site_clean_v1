/* Home grid (ES5): 16:9 cards, infinite scroll, placeholder-safe. */
(function(){
  var PAGE = 12;

  var grid = document.getElementById('homeGrid') ||
             document.getElementById('workGrid') ||
             document.getElementById('grid');
  var scroller = document.getElementById('workScroller') || null;
  if (!grid) return;

  grid.innerHTML = '';

  function card(it){
    var slug = it.slug || '';
    var img  = it.cover || ('/assets/work/' + slug + '/cover.jpg');
    var href = it.href  || ('/project?slug=' + encodeURIComponent(slug));
    var meta = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var title = it.title || 'Project';

    return ''+
      '<article class="card">'+
        '<a class="cover" href="'+href+'">'+
          '<span class="ratio-169">'+
            '<img loading="lazy" decoding="async" src="'+img+'" alt="" '+
            'onerror="this.onerror=null;this.src=\'/assets/work/placeholder-16x9.jpg\'">'+
          '</span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+href+'">'+title+'</a>'+
          '<div class="meta">'+meta+'</div>'+
        '</div>'+
      '</article>';
  }

  function loadJSON(done){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function next(){
      if (i >= bases.length){ done([]); return; }
      var url = bases[i++] + 'assets/work.json?v=' + (new Date().getTime());
      fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .then(function(j){ if (Array.isArray(j)) done(j); else next(); })
        .catch(function(){ next(); });
    }
    next();
  }

  var items = [], cursor = 0, busy = false, finished = false;

  function renderMore(){
    if (busy || finished || !items.length) return;
    busy = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++) html += card(items[i]);
    if (html) grid.insertAdjacentHTML('beforeend', html);

    cursor = end;
    finished = cursor >= items.length;
    busy = false;

    var root = scroller || document.documentElement;
    if (!finished && (root.scrollHeight <= root.clientHeight + 16)) renderMore();
  }

  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    (scroller || document.body).appendChild(sentinel);
  }

  var io = new IntersectionObserver(function(ents){
    for (var k=0;k<ents.length;k++){
      if (ents[k].isIntersecting) renderMore();
    }
  }, { root: scroller || null, rootMargin:'400px 0px', threshold:0.01 });

  loadJSON(function(list){
    items = list && list.length ? list : [];
    if (!items.length){
      // placeholders so layout shows shape
      for (var n=1;n<=24;n++){
        items.push({ slug:'ph-'+n, title:'Project '+n, client:'—', year:'', role:'',
                     cover:'/assets/work/placeholder-16x9.jpg', href:'#' });
      }
    }
    renderMore();
    io.observe(sentinel);
  });
})();