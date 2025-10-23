/* Home grid (ES5) — infinite scroll from / or /work/ */
(function () {
  var PAGE = 12;

  var grid = document.getElementById('homeGrid');
  if (!grid) return;

  function card(it){
    var title = it.title || 'Project';
    var meta  = [it.client, it.year, it.role].filter(Boolean).join(' · ');
    var cover = it.cover || ('/assets/work/' + (it.slug || 'unknown') + '/cover.jpg');
    var href  = it.slug ? ('/project?slug=' + encodeURIComponent(it.slug)) : '#';

    return '' +
      '<article class="card">' +
        '<a class="cover" href="' + href + '">' +
          '<span class="ratio-169">' +
            '<img loading="lazy" decoding="async" src="' + cover + '" alt="" ' +
              'onerror="this.onerror=null;this.src=\'/assets/work/placeholder-16x9.jpg\'">' +
          '</span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="' + href + '">' + title + '</a>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
      '</article>';
  }

  function placeholders(n){
    var out=[], i;
    for (i=0;i<n;i++){
      out.push({
        slug:'ph-'+(i+1), title:'Project '+(i+1),
        client:'ABC News', year:'—', role:'Production Designer',
        cover:'/assets/work/placeholder-16x9.jpg'
      });
    }
    return out;
  }

  function loadJSON(){
    var bases = ['/', './', '../'];
    var i = 0;
    function next(){
      if (i >= bases.length) return Promise.resolve(placeholders(24));
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache: 'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .then(function(d){ if(Array.isArray(d) && d.length) return d; throw 0; })
        .catch(function(){ return next(); });
    }
    return next();
  }

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

    var root = document.getElementById('workScroller') || document.documentElement;
    var scrollable = root.scrollHeight > root.clientHeight + 8;
    if (!scrollable && !done) renderMore();
  }

  function observe(){
    var root = document.getElementById('workScroller') || null;
    var target = document.getElementById('gridSentinel');
    if (!target){
      target = document.createElement('div');
      target.id = 'gridSentinel';
      target.style.height = '1px';
      (root || document.body).appendChild(target);
    }
    var io = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++){
        if (entries[i].isIntersecting) renderMore();
      }
    }, { root: root, rootMargin:'400px 0px', threshold:0.01 });
    io.observe(target);
  }

  loadJSON().then(function(list){
    items = Array.isArray(list) ? list : [];
    if (items.length < 30){
      var need = 30 - items.length, base = items.length;
      for (var i=0;i<need;i++){
        items.push({
          slug:'ph-'+(base+i+1), title:'Project '+(base+i+1),
          client:'ABC News', year:'—', role:'Production Designer',
          cover:'/assets/work/placeholder-16x9.jpg'
        });
      }
    }
    cursor = 0; loading = false; done = false; added = {};
    renderMore(); observe();
  });
})();