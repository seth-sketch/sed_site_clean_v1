/* press-home.js (defensive) — render press teasers if container exists or inject lightweight section */
(function(){"use strict";
  var LIMIT_HOME=6;
  function q(sel){ return document.querySelector(sel); }
  function tryFetch(url){ return fetch(url,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadPress(cb){
    var bases=['/assets/press.json','./assets/press.json','../assets/press.json'];
    (function next(i){ if(i>=bases.length) return cb([]);
      tryFetch(bases[i]+'?v='+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); });
    })(0);
  }
  function itemHTML(p){
    var u=p.url||'#', t=p.title||'Press', o=p.outlet||p.source||'', d=p.date||'', img=p.thumb||"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/><path d='M0 9 L6 3 L10 7 L13 5 L16 9Z' fill='%23d0d0d0'/><circle cx='4' cy='3' r='1' fill='%23c0c0c0'/><text x='8' y='5' dominant-baseline='middle' text-anchor='middle' font-size='1.2' fill='%23999'>16:9</text></svg>";
    return ''+
      '<article class="card">'+
        '<a class="cover" href="'+u+'" target="_blank" rel="noopener">'+
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+u+'" target="_blank" rel="noopener"><strong>'+t+'</strong></a>'+
          '<div class="meta">'+[o,d].filter(Boolean).join(' · ')+'</div>'+
        '</div>'+
      '</article>';
  }
  function ensureMount(){
    var m=q('#pressGrid')||q('[data-press="home"]');
    if(m) return m;
    var main=document.querySelector('main')||document.body;
    var sec=document.createElement('section');
    sec.id='press-home-autogen';
    sec.innerHTML='<h2>Press</h2><div id="pressGrid"></div>';
    main.appendChild(sec);
    return sec.querySelector('#pressGrid');
  }
  function init(){
    loadPress(function(list){
      if(!list||!list.length) return;
      var grid=ensureMount(); if(!grid) return;
      var html='', n=Math.min(LIMIT_HOME, list.length);
      for(var i=0;i<n;i++) html+=itemHTML(list[i]);
      grid.innerHTML=html;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();