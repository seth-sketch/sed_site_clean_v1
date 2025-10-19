(function(){
  function getSlug(){
    var q = location.search.replace(/^\?/, '');
    if (q){
      var parts=q.split('&'), params={};
      for (var i=0;i<parts.length;i++){
        var kv=parts[i].split('=');
        if (kv[0]) params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]||'');
      }
      if (params.slug) return params.slug;
    }
    var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
    return m ? m[1] : null;
  }
  function loadJSON(){
    var bases=['','../','../../','/'], i=0;
    function next(){
      if (i>=bases.length) return Promise.reject(new Error('work.json not found'));
      var url=bases[i++]+'assets/work.json?v='+Date.now();
      return fetch(url,{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json();}).catch(function(){return next();});
    }
    return next();
  }
  function $(s){return document.querySelector(s);}
  function setText(sel,txt){var el=$(sel); if(el) el.textContent=txt; return el;}
  function setHTML(sel,html){var el=$(sel); if(el) el.innerHTML=html; return el;}

  var slug=getSlug(); if(!slug) return;

  loadJSON().then(function(list){
    if (!list || !list.length) return;
    var idx=-1, item=null;
    for (var i=0;i<list.length;i++){ if(list[i].slug===slug){ idx=i; item=list[i]; break; } }
    if (!item) return;

    setText('[data-project="title"], h1', item.title||'Project');
    setText('[data-project="meta"]', [item.client,item.year,item.role].filter(Boolean).join(' · '));

    var heroSrc=item.cover || (item.gallery&&item.gallery[0]) || '../assets/work/placeholder-16x9.jpg';
    var heroEl=setHTML('[data-project="hero"]','<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');

    var thumbs=$('[data-project="thumbs"]');
    if (thumbs && item.gallery && item.gallery.length){
      var t=''; for (var g=0; g<item.gallery.length; g++){
        var src=item.gallery[g];
        t+='<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>';
      }
      thumbs.innerHTML=t;
      thumbs.addEventListener('click', function(e){
        var btn = e.target.closest ? e.target.closest('.thumb') : (e.target.className==='thumb'? e.target : null);
        if (btn && heroEl){ heroEl.innerHTML='<span class="ratio-169"><img src="'+btn.getAttribute('data-src')+'" alt=""></span>'; window.scrollTo(0,0); }
      });
    } else if (thumbs){ thumbs.innerHTML=''; }

    var nextEl=$('[data-project="next"]');
    if (nextEl){
      var nxt=list[(idx+1)%list.length];
      nextEl.setAttribute('href','project.html?slug='+encodeURIComponent(nxt.slug));
      var span=nextEl.querySelector('span'); if(span) span.textContent=nxt.title||'Next project';
    }
    var backEl=$('[data-project="back"]'); if (backEl) backEl.setAttribute('href','../index.html#work');
  });
})();