/* Project page loader (ES5) — fills hero + thumbs + meta from assets/work.json */
(function () {
  function getSlug() {
    var q = location.search.replace(/^\?/, ''), p = {};
    if (q) {
      var parts = q.split('&');
      for (var i=0;i<parts.length;i++){
        var kv = parts[i].split('=');
        if (kv[0]) p[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      }
    }
    if (p.slug) return p.slug;
    var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  function loadJSON() {
    var bases = ['', './', '../', '/'], i = 0;
    function next(){
      if (i >= bases.length) return Promise.reject(new Error('work.json not found'));
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return next(); });
    }
    return next();
  }

  function $(s){ return document.querySelector(s); }
  function setText(s, t){ var el=$(s); if(el) el.textContent=t; return el; }
  function setHTML(s, h){ var el=$(s); if(el) el.innerHTML=h; return el; }

  var slug = getSlug();
  if (!slug) return;

  loadJSON().then(function(list){
    if (!list || !list.length) return;

    var idx=-1, item=null;
    for (var i=0;i<list.length;i++){ if (list[i].slug === slug){ idx=i; item=list[i]; break; } }
    if (!item) return;

    setText('[data-project="title"]', item.title || 'Project');
    setText('[data-project="meta"]', [item.client, item.year, item.role].filter(Boolean).join(' · '));

    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]',
      '<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');

    // thumbs under hero
    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl){
      var t = '';
      if (item.gallery && item.gallery.length){
        for (var g=0; g<item.gallery.length; g++){
          var src = item.gallery[g];
          t += '<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>';
        }
      }
      thumbsEl.innerHTML = t;
      thumbsEl.addEventListener('click', function(e){
        var btn = e.target.closest ? e.target.closest('.thumb') : null;
        if (btn && heroEl){
          heroEl.innerHTML = '<span class="ratio-169"><img src="'+btn.getAttribute('data-src')+'" alt=""></span>';
          window.scrollTo(0,0);
        }
      });
    }

    // optional project-level press link (if you add `press` url in work.json)
    if (item.press){
      var wrap = document.getElementById('projectPress');
      var link = document.getElementById('projectPressLink');
      if (wrap && link){ link.href=item.press; wrap.style.display='block'; }
    }

    var back = $('[data-project="back"]');
    if (back) back.href = '/#work';

    var next = $('[data-project="next"]');
    if (next){
      var nxt = list[(idx + 1) % list.length];
      next.setAttribute('href', '/project?slug=' + encodeURIComponent(nxt.slug));
      var label = next.querySelector('span');
      if (label) label.textContent = nxt.title || 'Next project';
    }
  });
})();