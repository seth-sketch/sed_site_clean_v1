/* press-home.js — HOME: links-only list. PRESS PAGE: small thumb cards w/ title + desc.
   Also supports combined “Press & Awards” page (awards section on top). */
(function(){
  "use strict";
  var LIMIT_HOME = 8; // show up to 8 links on home

  function $(s){ return document.querySelector(s); }
  function j(url){ return fetch(url,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadPress(cb){
    var bases=["/assets/press.json","./assets/press.json","../assets/press.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }

  // --- HOME: links only ------------------------------------------------------
  function ensureHomeMount(){
    // prefer explicit container if present
    var el = $("#pressLinks") || $("[data-press='links']");
    if (el) return el;
    // else auto-insert a simple section below the “Awards” or “Work” section
    var after = $("#awards") || $("#work") || $("main");
    var sec = document.createElement("section");
    sec.className = "section";
    sec.id = "press-links-home";
    sec.innerHTML = '<h2>Press</h2><ul id="pressLinks" class="press-links"></ul>';
    after.parentNode.insertBefore(sec, after.nextElementSibling);
    return sec.querySelector("#pressLinks");
  }
  function renderHomeLinks(list){
    var m = ensureHomeMount(); if (!m) return;
    var n = Math.min(LIMIT_HOME, list.length), html="";
    for (var i=0;i<n;i++){
      var p=list[i], u=p.url||"#", t=p.title||"Press", o=p.outlet||p.source||"", d=p.date||"";
      html += '<li><a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'
           +  (o||d ? '<span class="meta"> — '+[o,d].filter(Boolean).join(" · ")+'</span>' : '')
           +  '</li>';
    }
    m.innerHTML = html;
  }

  // --- PRESS PAGE: small thumbs ---------------------------------------------
  function ensurePressMount(){
    // (A) explicit grid
    var el = $("#pressGrid") || $("[data-press='grid']");
    if (el) return el;
    // (B) combined “Press & Awards” page scaffold
    var main = $("main") || document.body;
    var sec = document.createElement("section");
    sec.className = "section";
    sec.id = "press-page";
    sec.innerHTML = '<h2>Press</h2><div id="pressGrid" class="press-grid small"></div>';
    main.appendChild(sec);
    return sec.querySelector("#pressGrid");
  }
  function cardSmall(p){
    var u=p.url||"#", t=p.title||"Press", o=p.outlet||p.source||"", d=p.date||"", img=p.thumb||
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/></svg>";
    var desc=p.description||p.summary||"";
    return ''+
      '<article class="press-card small">'+
        '<a class="cover" href="'+u+'" target="_blank" rel="noopener">'+
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>'+
        '</a>'+
        '<div class="body">'+
          '<a class="title" href="'+u+'" target="_blank" rel="noopener">'+t+'</a>'+
          '<div class="meta">'+[o,d].filter(Boolean).join(" · ")+'</div>'+
          (desc?'<p class="desc">'+desc+'</p>':'')+
        '</div>'+
      '</article>';
  }
  function renderPressPage(list){
    var m = ensurePressMount(); if (!m) return;
    var html=""; for (var i=0;i<list.length;i++) html += cardSmall(list[i]);
    m.innerHTML = html;
  }

  function init(){
    loadPress(function(list){
      var path = location.pathname.replace(/\/+$/,"");
      if (path === "" || path === "/") {
        // HOME: links only
        renderHomeLinks(list);
      } else if (path === "/press") {
        // PRESS PAGE: small thumbs + desc
        renderPressPage(list);
      } else {
        // Optional: if this script is loaded elsewhere, do nothing
      }
    });
  }
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();