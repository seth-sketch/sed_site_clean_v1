/* project.js — fills project detail page from assets/work.json (vanilla ES5) */
(function () {
  function getSlug(){
    // Prefer ?slug=, then fallback to /work/<slug>.html
    var s = null;
    if (location.search.indexOf('slug=') !== -1){
      var q = location.search.slice(1).split('&');
      for (var i=0;i<q.length;i++){
        var kv = q[i].split('=');
        if (decodeURIComponent(kv[0]) === 'slug'){
          s = decodeURIComponent(kv[1] || '').trim();
          break;
        }
      }
    }
    if (!s){
      var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
      s = m ? m[1] : null;
    }
    return s;
  }

  function $(sel){ return document.querySelector(sel); }
  function setText(sel, txt){ var el = $(sel); if (el) el.textContent = txt; return el; }
  function setHTML(sel, html){ var el = $(sel); if (el) el.innerHTML = html; return el; }

  function tryFetch(url){ return fetch(url, { cache:'no-store' }).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadWork(cb){
    var bases = ['/assets/work.json', './assets/work.json', '../assets/work.json'];
    (function next(i){
      if (i >= bases.length) return cb([]);
      tryFetch(bases[i] + '?v=' + Date.now())
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(function(){ next(i+1); });
    })(0);
  }

  function buildPressHTML(item){
    var links = [];
    if (typeof item.press === 'string') links = [item.press];
    else if (Object.prototype.toString.call(item.press) === '[object Array]') links = item.press;
    if (!links.length) return '';
    var html = '<div class="detail-press"><h3>Press</h3><ul class="list">';
    for (var i=0;i<links.length;i++){
      var u = links[i]; if (!u) continue;
      html += '<li><a href="'+u+'" target="_blank" rel="noopener">Link</a></li>';
    }
    html += '</ul></div>';
    return html;
  }

  function render(item, idx, list){
    if (!item) return;
    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]', [item.client,item.year,item.role].filter(Boolean).join(' · '));

    // Hero (16:9)
    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]', '<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');

    // Thumbs / gallery switcher
    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length){
      var t='';
      for (var g=0; g<item.gallery.length; g++){
        var src = item.gallery[g];
        t += '<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>';
      }
      thumbsEl.innerHTML = t;
      thumbsEl.addEventListener('click', function(e){
        var btn = e.target && (e.target.closest ? e.target.closest('.thumb') : (function(n){ while(n && (!n.classList || !n.classList.contains('thumb'))) n = n.parentNode; return n; })(e.target));
        if (btn){
          var src = btn.getAttribute('data-src');
          setHTML('[data-project="hero"]', '<span class="ratio-169"><img src="'+src+'" alt=""></span>');
          try{ window.scrollTo({ top: 0, behavior: 'smooth' }); }catch(_){}
        }
      });
    }else if (thumbsEl){
      thumbsEl.innerHTML = '';
    }

    // Description
    if (item.description) setHTML('[data-project="description"]', '<p>'+item.description+'</p>');

    // Back / next
    var backEl = $('[data-project="back"]'); if (backEl) backEl.href = '/#work';
    var nextEl = $('[data-project="next"]');
    if (nextEl && list && list.length){
      var next = list[(idx + 1) % list.length];
      nextEl.href = next.slug ? ('/project?slug=' + encodeURIComponent(next.slug)) : '/';
      var s = nextEl.querySelector('span'); if (s) s.textContent = next.title || 'Next project';
    }

    // Press, if present
    var pressWrap = document.getElementById('proj-press');
    if (pressWrap){
      var html = buildPressHTML(item);
      if (html){ pressWrap.style.display = ''; pressWrap.innerHTML = html; }
      else { pressWrap.style.display = 'none'; pressWrap.innerHTML = ''; }
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var slug = getSlug();
    if (!slug) return;

    loadWork(function(items){
      if (!items || !items.length) return;
      // normalize covers to absolute root-ish (works on CF Pages)
      for (var i=0;i<items.length;i++){
        if (items[i].cover && items[i].cover.charAt(0) !== '/') items[i].cover = '/' + items[i].cover.replace(/^\/+/,'');
        if (items[i].gallery && items[i].gallery.length){
          for (var j=0;j<items[i].gallery.length;j++){
            var s = items[i].gallery[j];
            items[i].gallery[j] = (s.charAt(0) === '/' ? s : '/' + s.replace(/^\/+/,''));
          }
        }
      }
      var idx = 0, found = null;
      for (var k=0;k<items.length;k++){ if (items[k].slug === slug){ idx = k; found = items[k]; break; } }
      render(found || items[0], idx, items);
    });
  });
})();