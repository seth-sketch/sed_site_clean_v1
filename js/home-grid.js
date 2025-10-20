/* global Promise, IntersectionObserver */
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
  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var img   = it.cover || (it.gallery && it.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var href  = it.slug ? ('project.html?slug=' + encodeURIComponent(it.slug)) : (it.href || '#');
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
  function loadJSON(){
    var bases = ['', './', '../', '/']; var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }
  var items=[], cursor=0, loading=false, done=false, seen={};
  function renderMore(){
    if (loading || done) return;
    loading = true;
    var end = Math.min(cursor + PAGE, items.length), html='';
    for (var j = cursor; j < end; j++){
      var it = items[j];
      if (!it || !it.slug || seen[it.slug]) continue;
      seen[it.slug] = 1;
      html += card(it);
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end;
    if (cursor >= items.length) done = true;
    loading = false;
    var root = scroller || document.documentElement;
    if (!done && (root.scrollHeight <= root.clientHeight + 8)) renderMore();
  }
  function makeSentinel(where){
    var s = document.createElement('div');
    s.id = 'gridSentinel';
    s.style.cssText = 'height:1px;width:100%';
    where.appendChild(s);
    return s;
  }
  var sentinel = makeSentinel(scroller || document.body);
  var io = new IntersectionObserver(function(entries){
    for (var k=0;k<entries.length;k++){ if (entries[k].isIntersecting) renderMore(); }
  }, { root: scroller || null, rootMargin:'400px 0px', threshold:0.01 });
  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    if (items.length < 12){
      for (var p=items.length; p<12; p++){
        items.push({ slug:'ph-'+(p+1), title:'Project '+(p+1), client:'', year:'', role:'',
          cover:'assets/work/placeholder-16x9.jpg', href:'#' });
      }
    }
    cursor=0; loading=false; done=false; seen={};
    renderMore();
    io.observe(sentinel);
  });
})();