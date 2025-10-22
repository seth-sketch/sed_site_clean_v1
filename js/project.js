/* project.js — fills project detail page from assets/work.json */
(function () {
  function getSlug(){
    var q = location.search.slice(1).split('&');
    for (var i=0;i<q.length;i++){
      var kv = q[i].split('=');
      if (decodeURIComponent(kv[0]) === 'slug') return decodeURIComponent(kv[1]||'');
    }
    var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  function $(s){ return document.querySelector(s); }
  function setText(sel, txt){ var el=$(sel); if (el) el.textContent = txt; return el; }
  function setHTML(sel, html){ var el=$(sel); if (el) el.innerHTML = html; return el; }

  function loadJSON(cb){
    var bases = ['', './', '../', '/'];
    var i=0;
    (function tryNext(){
      if (i>=bases.length){ cb([]); return; }
      var url = bases[i++] + 'assets/work.json?v=' + Date.now();
      fetch(url, { cache:'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(tryNext);
    })();
  }

  var slug = getSlug();
  if (!slug) return;

  loadJSON(function(list){
    if (!list || !list.length) return;
    var idx=-1, item=null;
    for (var i=0;i<list.length;i++){ if (list[i].slug===slug){ idx=i; item=list[i]; break; } }
    if (!item) return;

    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]', [item.client,item.year,item.role].filter(Boolean).join(' · '));

    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]',
      '<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');

    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length){
      var t='';
      for (var g=0; g<item.gallery.length; g++){
        var src = item.gallery[g];
        t += '<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>';
      }
      thumbsEl.innerHTML = t;
      thumbsEl.addEventListener('click', function(e){
        var btn = e.target.closest ? e.target.closest('.thumb') : null;
        if (btn && heroEl){
          heroEl.innerHTML = '<span class="ratio-169"><img src="'+btn.getAttribute('data-src')+'" alt=""></span>';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }else if (thumbsEl){
      thumbsEl.innerHTML = '';
    }

    var backEl = $('[data-project="back"]'); if (backEl) backEl.href = '/#work';
    var nextEl = $('[data-project="next"]');
    if (nextEl){
      var nxt = list[(idx+1)%list.length];
      nextEl.href = '/project?slug='+encodeURIComponent(nxt.slug);
      var s = nextEl.querySelector('span'); if (s) s.textContent = nxt.title || 'Next';
    }

    // Optional project-specific press (string or array) — shown only if present
    var pressWrap = $('[data-project="press"]');
    if (pressWrap){
      var links = [];
      if (typeof item.press === 'string') links = [item.press];
      else if (Array.isArray(item.press)) links = item.press;
      if (links.length){
        var html = '<h3>Press</h3><ul class="list">';
        for (var p=0;p<links.length;p++){ html+='<li><a href="'+links[p]+'" target="_blank" rel="noopener">Link</a></li>'; }
        html += '</ul>';
        pressWrap.innerHTML = html;
      }else{
        pressWrap.innerHTML = '';
      }
    }
  });
})();