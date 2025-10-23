(function(){
  "use strict";
  function j(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(cb){
    var bases=["/assets/awards.json","./assets/awards.json","../assets/awards.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }
  function li(a){ return "<li>"+[a.name,a.year,a.organization].filter(Boolean).join(" — ")+"</li>"; }
  function renderHome(list){ var ul=document.getElementById("awardsList"); if(ul) ul.innerHTML=list.slice(0,6).map(li).join(""); }
  function renderFull(list){ var ul=document.getElementById("awardsFull"); if(ul) ul.innerHTML=list.map(li).join(""); }
  function init(){ load(function(list){ renderHome(list); renderFull(list); }); }
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();