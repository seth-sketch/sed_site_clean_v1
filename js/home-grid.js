/* Home grid (ES5): infinite scroll, 16:9 covers, placeholder fallback */
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

  grid.innerHTML = '';

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                        : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169"><img loading="lazy" decoding="async" src="' + img + '" ' +
            'onerror="this.onerror=null;this.src=\'assets/work/placeholder-16x9.jpg\'" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  function xhrJSON(url, cb){
    try{
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.onreadystatechange = function(){
        if (x.readyState === 4){
          if (x.status >= 200 && x.status < 300){
            try { cb(JSON.parse(x.responseText)); } catch(e){ cb([]); }
          } else { cb([]); }
        }
      };
      x.send();
    }catch(_){ cb([]); }
  }

  function loadWork(cb){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function next(){
      if (i >= bases.length) return cb([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      xhrJSON(url, function(data){
        if (data && data.length) cb(data);
        else next();
      });
    }
    next();
  }

  var items=[], cursor=0, loading=false, done=false, added={};
  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i=cursor; i<end; i++){
      var it = items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;
      added[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    // If nothing scrolls yet, keep adding until it does
    var root = scroller || document.documentElement;
    var filled = root.scrollHeight > root.clientHeight + 8;
    if (!filled && !done) renderMore();
  }

  function makeSentinel(where){
    var s = document.createElement('div');
    s.id = 'gridSentinel';
    s.style.cssText = 'height:1px;width:100%';
    where.appendChild(s);
    return s;
  }
  var sentinel = scroller ? makeSentinel(scroller) : makeSentinel(document.body);

  function observe(root){
    if (!('IntersectionObserver' in window)){
      window.addEventListener('scroll', function(){
        var rect = sentinel.getBoundingClientRect();
        if (rect.top < (window.innerHeight + 200)) renderMore();
      });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root || null, rootMargin:'400px 0px', threshold:0.01 });
    io.observe(sentinel);
  }

  loadWork(function(list){
    items = (list && list.length) ? list : [];
    cursor = 0; loading = false; done = false; added = {};
    renderMore();
    observe(scroller || null);
  });
})();