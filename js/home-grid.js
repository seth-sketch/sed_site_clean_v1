(function(){
  "use strict";
  var PAGE = 12;
  var PLACEHOLDER="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/></svg>";

  function byId(id){ return document.getElementById(id); }
  function gridEl(){ return byId('homeGrid') || byId('workGrid') || document.querySelector('.grid'); }

  function sentinelEl(g){
    var s = byId('gridSentinel');
    if(!s){
      s = document.createElement('div');
      s.id = 'gridSentinel';
      s.style.cssText = 'height:1px;';
      (g && g.parentNode ? g.parentNode : document.body).appendChild(s);
    }
    return s;
  }

  function fetchJSON(url){
    return fetch(url,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); });
  }

  function tryWorkList(cb){
    var bases=['/assets/work.json','./assets/work.json','../assets/work.json'];
    (function next(i){
      if(i>=bases.length) return cb([]);
      fetchJSON(bases[i]+'?v='+(Date.now()))
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(function(){ next(i+1); });
    })(0);
  }

  function card(it){
    var title=it.title||'Untitled Project';
    var meta=[it.client,it.year,it.role].filter(Boolean).join(' · ');
    var cover=it.cover||(it.gallery&&it.gallery[0])||PLACEHOLDER;
    var href=it.slug?('/project.html?slug='+encodeURIComponent(it.slug)):'#';
    return ''+
      '<article class="card">'+
        '<a class="cover" href="'+href+'">'+
          '<span class="ratio-169"><img loading="lazy" src="'+cover+'" alt=""></span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+href+'">'+title+'</a>'+(meta?'<div class="meta">'+meta+'</div>':'')+
        '</div>'+
      '</article>';
  }

  function attachImageFallback(root){
    root.addEventListener('error', function(e){
      var img=e.target && e.target.tagName==='IMG' ? e.target : null;
      if(!img) return; img.src=PLACEHOLDER; img.setAttribute('data-ph','1');
    }, true);
  }

  function start(list){
    var g = gridEl(); if(!g || !list || !list.length) return;
    attachImageFallback(g);
    var s = sentinelEl(g);
    var i=0, loading=false, done=false;

    function renderMore(){
      if(done||loading) return false;
      loading = true;
      var end=Math.min(i+PAGE, list.length), html='';
      for(var k=i;k<end;k++) html+=card(list[k]);
      i=end;
      if(html){
        var tmp=document.createElement('div'); tmp.innerHTML=html;
        while(tmp.firstChild) g.appendChild(tmp.firstChild);
      }
      if(i>=list.length) done=true;
      loading=false;
      return !done;
    }

    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(ents){
        for (var j=0;j<ents.length;j++){
          if(ents[j].isIntersecting){ renderMore(); }
        }
      },{root:null, rootMargin:'0px 0px 360px 0px', threshold:0});
      io.observe(s);
    } else {
      function onScroll(){
        var rect=s.getBoundingClientRect();
        var vh=window.innerHeight||document.documentElement.clientHeight;
        if(rect.top<vh+360) renderMore();
      }
      window.addEventListener('scroll', onScroll);
    }

    // Make sure the page can actually scroll after first paint
    function fillViewport(){
      var guard=0;
      while(guard++<50){
        var rect=s.getBoundingClientRect();
        var vh=window.innerHeight||document.documentElement.clientHeight;
        if(rect.top>vh+240) break;
        if(!renderMore()) break;
      }
    }
    renderMore();
    requestAnimationFrame(fillViewport);
    window.addEventListener('resize', fillViewport);
  }

  function normalize(list){
    for(var i=0;i<list.length;i++){
      var it=list[i];
      if(it.cover && it.cover.charAt(0)!=='/') it.cover='/'+it.cover.replace(/^\/+/,'');
      if(it.gallery&&it.gallery.length){
        for(var j=0;j<it.gallery.length;j++){
          var p=it.gallery[j];
          it.gallery[j]=(p.charAt(0)==='/'?p:'/'+p.replace(/^\/+/,''));
        }
      }
    }
    return list;
  }

  function init(){
    tryWorkList(function(list){ start(normalize(Array.isArray(list)?list:[])); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();