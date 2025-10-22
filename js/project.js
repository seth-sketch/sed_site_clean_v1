/* Project page loader — big 16:9 + thumbs + optional press link */
(function () {
  function getSlug() {
    var q = location.search.replace(/^\?/, '');
    var params = {};
    if (q) q.split('&').forEach(function(kv){
      var p = kv.split('=');
      if (p[0]) params[decodeURIComponent(p[0])] = decodeURIComponent(p[1]||'');
    });
    if (params.slug) return params.slug;
    var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }

  function loadWorkJSON() {
    return fetch('/assets/work.json?v=' + Date.now(), { cache:'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); });
  }

  function $(s){return document.querySelector(s);}
  function setText(s,t){var el=$(s); if(el) el.textContent=t; return el;}
  function setHTML(s,h){var el=$(s); if(el) el.innerHTML=h; return el;}

  var slug = getSlug(); if(!slug) return;

  loadWorkJSON().then(function(list){
    if (!Array.isArray(list) || !list.length) return;
    var idx=-1, item=null;
    for (var i=0;i<list.length;i++){ if(list[i].slug===slug){idx=i; item=list[i]; break;} }
    if (!item) return;

    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]', [item.client,item.year,item.role].filter(Boolean).join(' · '));

    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || '/assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]','<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');

    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length){
      var t=''; for (var g=0; g<item.gallery.length; g++){
        var src=item.gallery[g];
        t+='<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>';
      }
      thumbsEl.innerHTML=t;
      thumbsEl.addEventListener('click', function(e){
        var btn=e.target.closest?e.target.closest('.thumb'):(e.target.className==='thumb'?e.target:null);
        if(btn && heroEl){ heroEl.innerHTML='<span class="ratio-169"><img src="'+btn.getAttribute('data-src')+'" alt=""></span>'; window.scrollTo(0,0); }
      });
    } else if (thumbsEl){ thumbsEl.innerHTML=''; }

    if (item.press){
      var wrap=document.getElementById('projectPress');
      var a=document.getElementById('projectPressLink');
      if (wrap && a){ a.href=item.press; wrap.style.display='block'; }
    }

    var backEl=$('[data-project="back"]'); if(backEl) backEl.href='/#work';
    var nextEl=$('[data-project="next"]');
    if(nextEl){
      var nxt=list[(idx+1)%list.length];
      nextEl.href='/project?slug='+encodeURIComponent(nxt.slug);
      var label=nextEl.querySelector('span'); if(label) label.textContent=nxt.title||'Next project';
    }
  });
})();