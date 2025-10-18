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
      if (i >= bases.length) { cb(new Error('work.json not found')); return; }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function(){
        if (xhr.readyState !== 4) return;
        if (xhr.status >= 200 && xhr.status < 300){
          try {
            var data = JSON.parse(xhr.responseText);
            cb(null, data);
          } catch(e){ tryNext(); }
        } else {
          tryNext();
        }
      };
      xhr.send();
    }
    tryNext();
  }

  function $(sel){ return document.querySelector(sel); }
  function setText(sel, txt){ var el = $(sel); if (el) el.textContent = txt; return el; }
  function setHTML(sel, html){ var el = $(sel); if (el) el.innerHTML = html; return el; }

  var slug = getSlug();
  if (!slug) return;

  loadWorkJSON(function (err, list) {
    if (err || !list || !list.length) return;

    // find item
    var idx = -1, item = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === slug) { idx = i; item = list[i]; break; }
    }
    if (!item) return;

    // Title + meta
    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]',
      [item.client, item.year, item.role].filter(Boolean).join(' · '));

    // Hero
    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '';
    var heroEl = setHTML('[data-project="hero"]',
      '<span class="ratio-169"><img src="' + (heroSrc || '') + '" alt=""></span>');

    // Thumbs (only if gallery exists)
    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length) {
      var t = '';
      for (var g = 0; g < item.gallery.length; g++) {
        var src = item.gallery[g];
        t += '<button class="thumb" data-src="' + src + '"><img loading="lazy" src="' + src + '" alt=""></button>';
      }
      thumbsEl.innerHTML = t;

      // click: accept both button .thumb and bare <img> inside it
      thumbsEl.addEventListener('click', function (e) {
        var n = e.target;
        while (n && n !== thumbsEl){
          if (n.className && String(n.className).indexOf('thumb') > -1){
            var s = n.getAttribute('data-src');
            if (s && heroEl) {
              heroEl.innerHTML = '<span class="ratio-169"><img src="' + s + '" alt=""></span>';
              window.scrollTo(0, 0);
            }
            break;
          }
          n = n.parentNode;
        }
      });
    } else if (thumbsEl) {
      thumbsEl.innerHTML = '';
    }

    // Back link
    var backEl = $('[data-project="back"]');
    if (backEl) backEl.setAttribute('href', 'index.html#work');

    // Next project
    var nextEl = $('[data-project="next"]');
    if (nextEl) {
      var nxt = list[(idx + 1) % list.length];
      nextEl.setAttribute('href', 'project.html?slug=' + encodeURIComponent(nxt.slug));
      var label = nextEl.querySelector('span');
      if (label) label.textContent = nxt.title || 'Next project';
    }
  });
})();