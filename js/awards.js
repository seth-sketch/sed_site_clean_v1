(function(){
  "use strict";
  function j(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(cb){
    var bases=["/assets/awards.json","./assets/awards.json","../assets/awards.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }
  function getYear(v){
    if(!v) return "";
    var m = String(v).match(/(19|20)\d{2}/);
    return m ? m[0] : String(v);
  }
  function textFor(a){
    var name = a.name || a.title || a.award || a.honor || a.prize || "";
    var org  = a.organization || a.org || a.company || a.issuer || a.presenter || "";
    var year = getYear(a.year || a.date || a.awarded || a.year_awarded);
    var bits = [];
    if(name) bits.push(name);
    if(year) bits.push(year);
    if(org)  bits.push(org);
    if(!bits.length){
      var any = a.label || a.text || a.description || "";
      if (any) bits.push(any);
    }
    return bits.join(" — ");
  }
  function li(a){ return "<li>"+textFor(a)+"</li>"; }
  function renderHome(list){
    var ul=document.getElementById("awardsList"); if(!ul) return;
    if(!list || !list.length){ ul.innerHTML="<li>(Add items to <code>assets/awards.json</code>)</li>"; return; }
    ul.innerHTML=list.slice(0,6).map(li).join("");
  }
  function renderFull(list){
    var ul=document.getElementById("awardsFull"); if(!ul) return;
    if(!list || !list.length){ ul.innerHTML="<li>(Add items to <code>assets/awards.json</code>)</li>"; return; }
    ul.innerHTML=list.map(li).join("");
  }
  function init(){ load(function(list){ renderHome(list); renderFull(list); }); }
  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();