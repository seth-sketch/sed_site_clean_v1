/* Project page: fills title/meta/hero/thumbs; shows per-project press if found */
(function(){
  function getSlug(){
    var m = location.search.match(/[?&]slug=([^&]+)/);
    if (m) return decodeURIComponent(m[1]);
    m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  function loadJSON(urls){
    var i = 0;
    function next(){
      if (i >= urls.length) return Promise.resolve(null);
      var u = urls[i++];
      return fetch(u, { cache:'no-store' }).then(function(r){
        if (!r.ok) throw 0; return r.json();
      }).catch(function(){ return next(); });
    }
    return next();
  }

  var slug = getSlug();
  if (!slug) return;

  Promise.all([
    loadJSON(['/assets/work.json?v='+Date.now(), '../assets/work.json?v='+Date.now(), '/work/assets/work.json?v='+Date.now()]),
    loadJSON(['/assets/press.json?v='+Date.now(), '../assets/press.json?v='+Date.now(), '/work/assets/press.json?v='+Date.now()])
  ]).then(function(res){
    var work = Array.isArray(res[0]) ? res[0] : [];
    var press = Array.isArray(res[1]) ? res[1] : [];

    var item = null, idx = -1;
    for (var i=0;i<work.length;i++){ if (work[i].slug === slug){ item = work[i]; idx = i; break; } }
    if (!item) return;

    var titleEl = document.querySelector('[data-project="title"]');
    var metaEl  = document.querySelector('[data-project="meta"]');
    var heroEl  = document.querySelector('[data-project="hero"]');
    var descEl  = document.querySelector('[data-project="description"]');
    var thEl    = document.querySelector('[data-project="thumbs"]');
    var backEl  = document.querySelector('[data-project="back"]');
    var nextEl  = document.querySelector('[data-project="next"]');

    if (titleEl) titleEl.textContent = item.title || 'Project';
    if (metaEl)  metaEl.textContent  = [item.client,item.year,item.role].filter(Boolean).join(' · ');
    if (descEl)  descEl.textContent  = item.description || '';

    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    if (heroEl) heroEl.innerHTML = '<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>';

    if (thEl && item.gallery && item.gallery.length){
      var html = '';
      for (var g=0; g<item.gallery.length; g++){
        var src = item.gallery[g];
        html += '<img src="'+src+'" alt="" data-src="'+src+'">';
      }
      thEl.innerHTML = html;
      thEl.addEventListener('click', function(e){
        var t = e.target;
        if (t && t.getAttribute('data-src') && heroEl){
          heroEl.innerHTML = '<span class="ratio-169"><img src="'+t.getAttribute('data-src')+'" alt=""></span>';
          window.scrollTo({top:0, behavior:'smooth'});
        }
      });
    } else if (thEl){
      thEl.innerHTML = '';
    }

    if (backEl) backEl.href = '/#work';
    if (nextEl){
      var nxt = work[(idx+1)%work.length];
      nextEl.href = '/project?slug=' + encodeURIComponent(nxt.slug);
      var s = nextEl.querySelector('span'); if (s) s.textContent = nxt.title || 'Next project';
    }

    // Per-project press (match by projectSlug or tag)
    var hasPress = [];
    for (var p=0;p<press.length;p++){
      var pr = press[p];
      if (pr.projectSlug === slug || (pr.tags && pr.tags.indexOf(slug) > -1)){
        hasPress.push(pr);
      }
    }
    if (hasPress.length){
      var box = document.getElementById('proj-press');
      var list = document.getElementById('proj-press-list');
      if (box && list){
        box.style.display = '';
        list.innerHTML = hasPress.map(function(pr){
          return '<li><a href="'+pr.url+'" target="_blank" rel="noopener">'+(pr.title||pr.source||'Press')+'</a></li>';
        }).join('');
      }
    }
  });
})();