/* Home grid (ES5) — XHR loader + infinite scroll inside .scroller */
(function () {
  var PAGE = 12;

  // Find grid + scroller
  var grid = document.getElementById('homeGrid') ||
             document.getElementById('grid') ||
             document.getElementById('workGrid');
  if (!grid) return;

  function findScroller(el){
    var n = el;
    while (n && n !== document.body){
      if (n.classList && n.classList.contains('scroller')) return n;
      n = n.parentNode;
    }
    return null;
  }
  var scroller = findScroller(grid);

  // Clean start (prevents duplicates)
  grid.innerHTML = '';

  // --------- helpers
  function placeholders(n){
    var out = [];
    for (var i=0;i<n;i++){
      out.push({
        slug: 'ph-' + (i+1),
        title: 'Project ' + (i+1),
        client: 'ABC News',
        year: '—',
        role: 'Production Designer',
        cover: 'assets/work/placeholder-16x9.jpg',
        href: '#'
      });
    }
    return out;
  }

  function cardHTML(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var primary = it.cover || ('assets/work/' + (it.slug || 'unknown') + '/cover.jpg');
    var href    = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug))
                          : (it.href || '#');

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + primary + '" alt="" ' +
                 'onerror="this.onerror=null;this.src=\\\'assets/work/placeholder-16x9.jpg\\\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  // --------- XHR loader that tries multiple bases
  function loadWorkJSON(cb){
    var bases = ['', './', '../', '/'];
    var i = 0;

    function tryNext(){
      if (i >= bases.length) { cb(null, placeholders(24)); return; }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function(){
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300){
          try {
            var data = JSON.parse(xhr.responseText);
            if (Object.prototype.toString.call(data) === '[object Array]' && data.length){
              cb(null, data);
            } else {
              tryNext();
            }
          } catch(e){
            tryNext();
          }
        } else {
          tryNext();
        }
      };
      xhr.send();
    }
    tryNext();
  }

  // --------- state + render + observe
  var items=[], cursor=0, loading=false, done=false, added={};

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++){
      var it = items[i];
      if (!it || !it.slug) continue;
      if (added[it.slug]) continue;
      added[it.slug] = 1;
      html += cardHTML(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;

    // If nothing scrolls yet, keep filling until it does
    var root = scroller || document.documentElement;
    var scrollable = root.scrollHeight > root.clientHeight + 8;
    if (!scrollable && !done) renderMore();
  }

  // Ensure sentinel
  var sentinel = document.getElementById('gridSentinel');
  if (!sentinel){
    sentinel = document.createElement('div');
    sentinel.id = 'gridSentinel';
    sentinel.style.height = '1px';
    if (scroller) scroller.appendChild(sentinel); else document.body.appendChild(sentinel);
  }

  function observe(target, root){
    if (!('IntersectionObserver' in window)){
      // Fallback: scroll listener
      (root || window).addEventListener('scroll', function(){
        var rect = target.getBoundingClientRect();
        if (rect.top < (window.innerHeight + 400)) renderMore();
      });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root || null, rootMargin:'400px 0px', threshold:0.01 });
    io.observe(target);
  }

  loadWorkJSON(function(err, list){
    items  = Array.isArray(list) ? list : [];
    cursor = 0; loading=false; done=false; added={};
    renderMore();
    observe(sentinel, scroller || null);
  });
})();