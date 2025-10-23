/* se-hero.js (defensive) — hero video + slides with late DOM + SPA tolerance */
(function(){"use strict";
  var PLACEHOLDER="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/><path d='M0 9 L6 3 L10 7 L13 5 L16 9Z' fill='%23d0d0d0'/><circle cx='4' cy='3' r='1' fill='%23c0c0c0'/><text x='8' y='5' dominant-baseline='middle' text-anchor='middle' font-size='1.2' fill='%23999'>16:9</text></svg>";
  function qsAll(selList){
    for (var i=0;i<selList.length;i++){ var el=document.querySelector(selList[i]); if(el) return el; }
    return null;
  }
  function parseCfg(){ 
    var el=qsAll(['#seSlidesJSON','script[data-hero-config]']);
    if(!el) return null;
    try{ return JSON.parse(el.textContent||'{}'); }catch(_){
      try{ return JSON.parse(el.innerText||'{}'); }catch(__){ return null; }
    }
  }
  function make(tag, attrs, kids){
    var e=document.createElement(tag);
    if(attrs) for(var k in attrs){
      if(k==='class') e.className=attrs[k];
      else if(k==='style') e.style.cssText = attrs[k];
      else e.setAttribute(k, attrs[k]);
    }
    if(kids) for(var i=0;i<kids.length;i++) e.appendChild(typeof kids[i]==='string'?document.createTextNode(kids[i]):kids[i]);
    return e;
  }
  function clear(el){ while(el && el.firstChild) el.removeChild(el.firstChild); }
  function showImg(stage, src){
    var img = make('img',{src:src,alt:'',loading:'eager'},null);
    img.onerror=function(){ img.src=PLACEHOLDER; img.setAttribute('data-ph','1'); };
    var wrap=make('div',{class:'ratio-169'},[img]);
    var next=make('div',{class:'se-slide',style:'opacity:0;transition:opacity .4s ease'},[wrap]);
    stage.appendChild(next);
    requestAnimationFrame(function(){ next.style.opacity='1'; });
    var prev=stage.children.length>1?stage.children[0]:null;
    if(prev) setTimeout(function(){ if(prev.parentNode) prev.parentNode.removeChild(prev); },450);
  }
  function showVideo(stage, src, onDone){
    clear(stage);
    var v=make('video',{src:src,playsinline:'',muted:'',autoplay:'',preload:'auto'},null);
    var wrap=make('div',{class:'ratio-169'},[v]);
    stage.appendChild(wrap);
    function finish(){ if(onDone) onDone(); }
    v.addEventListener('ended',finish); v.addEventListener('error',finish);
    try{ var p=v.play(); if(p&&p.then) p.catch(function(){}); }catch(_){}
  }
  function boot(){
    var stage=qsAll(['#heroStage','.heroStage','[data-hero-stage]','#hero','.hero']);
    var cfg=parseCfg();
    if(!stage || !cfg || !(cfg.video || (cfg.slides&&cfg.slides.length))) return false;
    var i=0, interval=Math.max(1000, +cfg.interval||4000);
    function rotate(){
      if(!cfg.slides || !cfg.slides.length) return;
      var src=cfg.slides[i]; i=(i+1)%cfg.slides.length;
      showImg(stage, src);
      setTimeout(rotate, interval);
    }
    if(cfg.video) showVideo(stage, cfg.video, rotate); else rotate();
    return true;
  }
  function whenReady(){
    if(boot()) return;
    var tries=0, t=setInterval(function(){
      tries++; if(boot()||tries>25) clearInterval(t);
    },200);
    var mo=new MutationObserver(function(){ boot(); });
    mo.observe(document.documentElement, {childList:true, subtree:true});
    window.addEventListener('pageshow', boot);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) boot(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', whenReady); else whenReady();
})();