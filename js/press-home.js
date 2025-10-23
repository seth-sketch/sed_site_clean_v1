(function(){
  "use strict";
  var LIMIT_HOME = 6;

  function j(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(cb){
    var bases=["/assets/press.json","./assets/press.json","../assets/press.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }

  // Home: links only
  function renderHome(list){
    var m = document.getElementById("pressLinks"); if(!m) return;
    var n = Math.min(LIMIT_HOME, list.length), html="";
    for (var i=0;i<n;i++){
      var p=list[i], u=p.url||"#", t=p.title||"Press", o=p.outlet||p.source||"", d=p.date||"";
      html += '<li><a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'
           +  (o||d?'<span class="meta"> — '+[o,d].filter(Boolean).join(" · ")+'</span>':'')
           +  '</li>';
    }
    m.innerHTML = html;
  }

  // /press: description first, small thumb to the side
  function renderPress(list){
    var g = document.getElementById("pressRichList"); if(!g) return;
    var html="";
    for (var i=0;i<list.length;i++){
      var p=list[i], u=p.url||"#",
          t=p.title||"Press", o=p.outlet||p.source||"", d=p.date||"",
          desc=p.desc||p.description||"", img=p.thumb||"";
      html += '<li class="press-item">'
           +    '<div class="body">'
           +      '<a class="title" href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'
           +      (o||d?'<div class="meta">'+[o,d].filter(Boolean).join(" · ")+'</div>':'')
           +      (desc?'<div class="desc">'+desc+'</div>':'')
           +    '</div>'
           +    '<a class="thumb" href="'+u+'" target="_blank" rel="noopener">'
           +      '<span class="ratio-169">'+(img?'<img loading="lazy" src="'+img+'" alt="">':'')+'</span>'
           +    '</a>'
           +  '</li>';
    }
    g.innerHTML = html;
  }

  function init(){
    var path = location.pathname.replace(/\/+$/,"");
    load(function(list){
      if ((path===""||path==="/"||path.endsWith("/index.html")) && document.getElementById("pressLinks")) renderHome(list);
      if ((path==="/press"||path.endsWith("/press")||path.endsWith("/press/index.html")) && document.getElementById("pressRichList")) renderPress(list);
    });
  }
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();