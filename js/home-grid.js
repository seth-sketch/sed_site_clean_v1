/* home-grid.js — builds 16:9 project cards with infinite scroll
   - Loads /assets/work.json and renders cards into #homeGrid.
   - Uses IntersectionObserver on #gridSentinel to load in pages.
   - Fully ES5 to run on static hosts. */

(function () {
  var PAGE = 12;
  var grid = document.getElementById('homeGrid');
  var sentinel = document.getElementById('gridSentinel');
  if (!grid || !sentinel) return;

  var items = [];
  var cursor = 0;
  var loading = false;
  var done = false;

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var cover = (it.cover || ('/assets/work/' + (it.slug || 'unknown') + '/cover.jpg')).replace(/^\.\/+/,'/');
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug)) : '#';

    // 16:9 cover enforced with .ratio-169 wrapper
    var html = '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169"><img loading="lazy" src="' + cover + '" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+href+'">' + title + '</a>' +
          (meta ? '<div class="meta">' + meta + '</div>' : '') +
        '</div>' +
      '</article>';
    return html;
  }

  function renderMore(){
    if (done || loading) return;
    loading = true;

    var end = Math.min(cursor + PAGE, items.length);
    var html = '';
    for (var i = cursor; i < end; i++) html += card(items[i]);
    cursor = end;
    if (html) {
      var tmp = document.createElement('div');
      tmp.innerHTML = html;
      while (tmp.firstChild) grid.appendChild(tmp.firstChild);
    }

    if (cursor >= items.length) done = true;
    loading = false;
  }

  function observe(){
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(entries){
        for (var i=0;i<entries.length;i++){
          if (entries[i].isIntersecting) renderMore();
        }
      }, { root: grid.parentNode && grid.parentNode.classList.contains('scroller') ? grid.parentNode : null, rootMargin: '0px 0px 200px 0px' });
      io.observe(sentinel);
    }else{
      // fallback: scroll listener on parent scroller or window
      var scroller = grid.parentNode && grid.parentNode.classList.contains('scroller') ? grid.parentNode : window;
      function onScroll(){
        var rect = sentinel.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        if (rect.top < vh + 200) renderMore();
      }
      (scroller === window ? window : scroller).addEventListener('scroll', onScroll);
    }
  }

  function tryFetch(url){
    return fetch(url, { cache:'no-store' }).then(function(r){ if(!r.ok) throw 0; return r.json(); });
  }

  function loadList(cb){
    // Be flexible for relative vs absolute paths
    var bases = ['/assets/work.json', './assets/work.json', '../assets/work.json'];
    (function next(i){
      if (i >= bases.length) return cb([]);
      tryFetch(bases[i] + '?v=' + Date.now())
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(function(){ next(i+1); });
    })(0);
  }

  loadList(function(list){
    items = Array.isArray(list) ? list : [];
    // If fewer items than a screenful, still render all
    cursor = 0; loading = false; done = false;
    renderMore();
    observe();
  });
})();