/* Home grid (ES5) — infinite scroll inside .scroller; 16:9 covers from assets/work.json */
(function () {
  var PAGE = 12;

  // find grid and its scroller
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
    var img   = it.cover || (it.slug ? ('assets/work/' + it.slug + '/cover.jpg') : 'assets/work/placeholder-16x9.jpg');
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug)) : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + img + '" alt="" ' +
                 'onerror="this.onerror=null;this.src=\\'assets/work/placeholder-16x9.jpg\\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

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

  function loadJSON(cb){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return cb(null, placeholders(24));
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();

      if (window.fetch){
        fetch(url, { cache:'no-store' })
          .then(function (r){ if (!r.ok) throw 0; return r.json(); })
          .then(function (d){ if (Array.isArray(d) && d.length) cb(null, d); else throw 0; })
          .catch(function (){ tryNext(); });
      } else {
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onreadystatechange = function(){
          if (x.readyState === 4){
            if (x.status >= 200 && x.status < 300){
              try {
                var d = JSON.parse(x.responseText);
                if (Array.isArray(d) && d.length) return cb(null, d);
              } catch(e){}
            }
            tryNext();
          }
        };
        x.send();
      }
    }
    tryNext();
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

    var root = scroller || document.documentElement;
    if (root.scrollHeight <= root.clientHeight + 8 && !done) renderMore();
  }

  function makeSentinel(where){
    var s = document.createElement('div');
    s.className = 'grid-sentinel';
    s.style.cssText = 'height:1px;width:100%';
    where.appendChild(s);
    return s;
  }
  var s1 = scroller ? makeSentinel(scroller) : null;
  var holder = (grid.closest && grid.closest('.section')) ? grid.closest('.section').parentNode : document.body;
  var s2 = makeSentinel(holder);

  function observe(root, target){
    var io = new IntersectionObserver(function(entries){
      for (var i=0; i<entries.length; i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root || null, rootMargin:'400px 0px', threshold:0.01 });
    io.observe(target);
  }

  loadJSON(function(err, list){
    items = Array.isArray(list) ? list : [];
    if (items.length < 24){
      var need = 24 - items.length, base = items.length;
      for (var k=0; k<need; k++){
        items.push({
          slug:'ph-'+(base+k+1), title:'Project '+(base+k+1),
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
