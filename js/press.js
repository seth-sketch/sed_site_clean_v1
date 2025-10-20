/* Press page (ES5) — loads assets/press.json and builds cards */
(function () {
  var PAGE = 18;
  var grid = document.getElementById('pressGrid');
  var scroller = document.getElementById('pressScroller');
  var sentinel = document.getElementById('pressSentinel');
  if (!grid || !scroller || !sentinel) return;

  function card(p){
    var t = p.title || 'Press';
    var s = [p.source||'', p.date||''].filter(Boolean).join(' · ');
    var u = p.url || '#';
    var img = p.image || '../assets/work/placeholder-16x9.jpg';
    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + u + '" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img loading="lazy" decoding="async" src="' + img + '" alt="">' +
          '</span></a>' +
        '<div class="footer">' +
          '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>' +
          '<div class="meta">' + s + '</div>' +
        '</div>' +
      '</article>';
  }

  function loadJSON(){
    var bases = ['../', './', '/', '../../']; var i=0;
    function next(){
      if (i>=bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/press.json?v=' + Date.now();
      return fetch(url, {cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).catch(next);
    }
    return next();
  }

  var items=[], cursor=0, loading=false, done=false;

  function renderMore(){
    if (loading || done || !items.length) return;
    loading = true;
    var end = Math.min(cursor+PAGE, items.length), html='';
    for (var i=cursor;i<end;i++) html += card(items[i]);
    if (html) grid.insertAdjacentHTML('beforeend', html);
    cursor = end; if (cursor >= items.length) done = true;
    loading = false;

    if (scroller.scrollHeight <= scroller.clientHeight + 8 && !done) renderMore();
  }

  var io = new IntersectionObserver(function(ents){
    for (var i=0;i<ents.length;i++){
      if (ents[i].isIntersecting) renderMore();
    }
  }, { root: scroller, rootMargin:'400px 0px', threshold:0.01 });

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    cursor=0; loading=false; done=false;
    renderMore();
    io.observe(sentinel);
  });
})();