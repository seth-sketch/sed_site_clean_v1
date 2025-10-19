/* Home grid — infinite scroll, robust path handling for / and /work/ */
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

  // Are we inside /work/ or /press/?
  var path = location.pathname.replace(/^\//,'');
  var atWork  = /^work\//.test(path);
  var atPress = /^press\//.test(path);

  // Make a URL absolute to site root if needed
  function norm(p){
    if (!p) return p;
    if (p[0] === '/' || /^https?:\/\//i.test(p)) return p; // already absolute
    return (atWork || atPress ? '../' : '') + p;            // step out one level
  }

  function cardHTML(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = norm(it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg');

    // project page lives at site root as project.html
    var href  = it.slug
      ? (atWork || atPress ? ('../project.html?slug=' + encodeURIComponent(it.slug))
                           : ('project.html?slug=' + encodeURIComponent(it.slug)))
      : (it.href || '#');

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
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function (r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function (){ return tryNext(); });
    }
    return tryNext().then(function(arr){
      var seen = {}, out = [];
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

  // sentinel inside scroller or parent
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