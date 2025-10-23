/* press-home.js — UL/LI aware + home inject under Work */
(function(){
  "use strict";
  var LIMIT_HOME = 6;
  function $(s){ return document.querySelector(s); }
  function j(url){ return fetch(url,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(cb){
    var bases=["/assets/press.json","./assets/press.json","../assets/press.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }
  function cardHTML(p){
    var u=p.url||"#", t=p.title||"Press", o=p.outlet||p.source||"", d=p.date||"", img=p.thumb||
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/></svg>";
    return ''+
      '<article class="card">'+
        '<a class="cover" href="'+u+'" target="_blank" rel="noopener">'+
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+u+'" target="_blank" rel="noopener"><strong>'+t+'</strong></a>'+
          '<div class="meta">'+[o,d].filter(Boolean).join(" · ")+'</div>'+
        '</div>'+
      '</article>';
  }
  function ensureMountForHome(){
    // Insert after #work on the index page
    var work = document.getElementById("work");
    if (!work) return null;
    var sec = document.createElement("section");
    sec.className = "section";
    sec.id = "press-home";
    sec.innerHTML = '<h2>Press</h2><div id="pressGrid"></div>';
    work.parentNode.insertBefore(sec, work.nextElementSibling);
    return sec.querySelector("#pressGrid");
  }
  function mount(){
    // Prefer an explicit container if it exists
    var el = $("#pressGrid") || $('[data-press="home"]');
    if (el) return el;
    // If we're on index (has #work and #awards), auto-inject between them
    if ($("#work") && $("#awards")) return ensureMountForHome();
    return null;
  }
  function render(list){
    var m = mount(); if (!m) return;
    var isUL = m.tagName === "UL";
    var cap  = (location.pathname.replace(/\/+$/,"") === "/press") ? list.length : Math.min(LIMIT_HOME, list.length);
    var html = "";
    for (var i=0;i<cap;i++){
      var card = cardHTML(list[i]);
      html += isUL ? ("<li>"+card+"</li>") : card;
    }
    m.innerHTML = html;
  }
  function init(){ load(render); }
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();