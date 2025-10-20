(function () {
  function getSlug(){
    var m = location.search.match(/[?&]slug=([^&]+)/); if (m) return decodeURIComponent(m[1]);
    m = location.pathname.match(/\/work\/([^\/]+)\.html$/); return m ? m[1] : null;
  }
  function loadWork(){
    var bases = ['', './', '../', '/']; var i=0;
    function next(){
      if (i>=bases.length) return Promise.reject(new Error('work.json not found'));
      var u = bases[i++] + 'assets/work.json?v=' + Date.now();
      return fetch(u, {cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).catch(function(){ return next(); });
    }
    return next();
  }
  function $(s){ return document.querySelector(s); }
  function setText(sel, t){ var el=$(sel); if(el) el.textContent=t; return el; }
  function setHTML(sel, h){ var el=$(sel); if(el) el.innerHTML=h; return el; }

  var slug = getSlug(); if (!slug) return;
  loadWork().then(function(list){
    if (!list || !list.length) return;
    var idx=-1, item=null;
    for (var i=0;i<list.length;i++){ if (list[i].slug===slug){ idx=i; item=list[i]; break; } }
    if (!item) return;
    setText('[data-project="title"], h1', item.title || 'Project');
    setText('[data-project="meta"]', [item.client,item.year,item.role].filter(Boolean).join(' · '));
    var heroSrc = item.cover || (item.gallery && item.gallery[0]) || 'assets/work/placeholder-16x9.jpg';
    var heroEl = setHTML('[data-project="hero"]','<span class="ratio-169"><img src="'+heroSrc+'" alt=""></span>');
    var thumbsEl = $('[data-project="thumbs"]');
    if (thumbsEl && item.gallery && item.gallery.length){
      var t=''; for (var g=0; g<item.gallery.length; g++){ var src=item.gallery[g];
        t += '<button class="thumb" data-src="'+src+'"><img loading="lazy" src="'+src+'" alt=""></button>'; }
      thumbsEl.innerHTML = t;
      thumbsEl.addEventListener('click', function(e){
        var btn = e.target.closest ? e.target.closest('.thumb') : null;
        if (btn && heroEl){ heroEl.innerHTML='<span class="ratio-169"><img src="'+btn.getAttribute('data-src')+'" alt=""></span>'; window.scrollTo(0,0); }
      });
    } else if (thumbsEl){ thumbsEl.innerHTML=''; }
    var pressWrap = $('[data-project="press"]');
    if (pressWrap){
      var links = [];
      if (item.press && item.press.length){ links = item.press; } 
      else if (item.pressUrl){ links = [{title:'Press', url:item.pressUrl}]; }
      if (links.length){
        var html = '<h3>Press</h3><ul class="list">' + links.map(function(p){
          var title = p.title || 'Press'; var url = p.url || '#';
          return '<li><a href="'+url+'" target="_blank" rel="noopener">'+title+'</a></li>';
        }).join('') + '</ul>';
        pressWrap.innerHTML = html;
      } else { pressWrap.innerHTML = ''; }
    }
    var backEl = $('[data-project="back"]'); if (backEl) backEl.setAttribute('href','index.html#work');
    var nextEl = $('[data-project="next"]');
    if (nextEl){
      var nxt = list[(idx+1)%list.length];
      nextEl.setAttribute('href','project.html?slug='+encodeURIComponent(nxt.slug));
      var label = nextEl.querySelector('span'); if (label) label.textContent = nxt.title || 'Next project';
    }
  });
})();