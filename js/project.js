/* Project page loader (ES5) — reads assets/work.json and fills the page */
(function () {
  function getSlug() {
    // Preferred: project.html?slug=...
    var q = location.search.replace(/^\?/, '');
    var params = {};
    if (q) {
      var parts = q.split('&');
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      }
    }
    if (params.slug) return params.slug;

    // Fallback: /work/<slug>.html
    var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  function loadWorkJSON(cb) {
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext() {
      if (i >= bases.length) return cb(new Error('work.json not found'));
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      if (window.fetch){
        fetch(url, { cache:'no-store' })
          .then(function(r){ if (!r.ok) throw 0; return r.json(); })
          .then(function(d){ cb(null, d); })
          .catch(function(){ tryNext(); });
      } else {
        var x = new XMLHttpRequest();
        x.open('GET', url, true);
        x.onreadystatechange = function(){
          if (x.readyState === 4){
            if (x.status >= 200 && x.status < 300){
              try { return cb(null, JSON.parse(x.responseText)); }
              catch(e){}
            }
            tryNext();
          }
        };
        x.send();
      }
    }
    tryNext();
  }

  function $(sel){ return document.querySelector(sel); }
  function setText(sel, txt){ var el = $(sel); if (el) el.textContent = txt; return el; }
  function setHTML(sel, html){ var el = $(sel); if (el) el.innerHTML = html; return el; }

  var slug = getSlug();
  if (!slug) return;

  loadWorkJSON(function(err, list){
    if (err || !list || !list.length) return;

    var idx = -1, item = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === slug) { idx = i; item = list[i]; break; }
    }
    if (!item) return;

    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]', [item.client, item.year, item.role].filter(Boolean).join(' · '));

    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]',
      '<span class="ratio-169"><img src="' + heroSrc + '" alt=""></span>');

    var descEl = $('[data-project="description"]');
    if (descEl) descEl.textContent = item.description || '';

    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length) {
      var t = '';
      for (var g = 0; g < item.gallery.length; g++) {
        var src = item.gallery[g];
        t += '<button class="thumb" data-src="' + src + '"><img loading="lazy" src="' + src + '" alt=""></button>';
      }
      thumbsEl.innerHTML = t;
      thumbsEl.addEventListener('click', function (e) {
        var target = e.target || e.srcElement;
        var btn = target.closest ? target.closest('.thumb') :
                 (target.className === 'thumb' ? target : null);
        if (btn && heroEl) {
          heroEl.innerHTML = '<span class="ratio-169"><img src="' + btn.getAttribute('data-src') + '" alt=""></span>';
          window.scrollTo(0, 0);
        }
      });
    } else if (thumbsEl) {
      thumbsEl.innerHTML = '';
    }

    var backEl = $('[data-project="back"]');
    if (backEl) backEl.setAttribute('href', 'index.html#work');

    var nextEl = $('[data-project="next"]');
    if (nextEl) {
      var nxt = list[(idx + 1) % list.length];
      nextEl.setAttribute('href', 'project.html?slug=' + encodeURIComponent(nxt.slug));
      var label = nextEl.querySelector('span');
      if (label) label.textContent = nxt.title || 'Next project';
    }
  });
})();
