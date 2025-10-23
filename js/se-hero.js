/* se-hero.js — poster-first hero (video ➜ slides), resilient boot */
(function () {
  "use strict";
  var PLACEHOLDER =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23000'/></svg>";

  function stage() {
    return document.getElementById("heroStage") ||
           document.querySelector(".heroStage") ||
           document.querySelector("[data-hero-stage]");
  }
  function cfgEl() { return document.getElementById("seSlidesJSON") || document.querySelector("script[data-hero-config]"); }
  function parseCfg(){
    var el = cfgEl(); if(!el) return null;
    try { return JSON.parse(el.textContent || "{}"); } catch(e) { return null; }
  }
  function make(tag, attrs, kids){
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) (k==="class") ? (e.className=attrs[k]) : (k==="style" ? e.style.cssText=attrs[k] : e.setAttribute(k, attrs[k]));
    if (kids) for (var i=0;i<kids.length;i++) e.appendChild(typeof kids[i]==="string" ? document.createTextNode(kids[i]) : kids[i]);
    return e;
  }
  function clear(el){ while(el && el.firstChild) el.removeChild(el.firstChild); }
  function fadeIn(stage, child){
    child.style.opacity = "0"; child.style.transition = "opacity .35s ease";
    stage.appendChild(child); requestAnimationFrame(function(){ child.style.opacity="1"; });
    var prev = stage.children.length>1 ? stage.children[0] : null;
    if (prev) setTimeout(function(){ prev.remove(); }, 400);
  }
  function showImg(stageEl, src){
    var img = make("img", { src: src || PLACEHOLDER, alt: "" }, null);
    img.onerror = function(){ img.src = PLACEHOLDER; };
    var wrap = make("div", { class: "ratio-169" }, [img]);
    fadeIn(stageEl, make("div", { class: "se-slide" }, [wrap]));
  }
  function showVideo(stageEl, src, onDone){
    clear(stageEl);
    var v = make("video", { src: src, playsinline: "", muted: "", autoplay: "", preload: "auto" }, null);
    var wrap = make("div", { class: "ratio-169" }, [v]);
    fadeIn(stageEl, make("div", { class: "se-slide" }, [wrap]));
    function finish(){ if(onDone) onDone(); }
    v.addEventListener("ended", finish);
    v.addEventListener("error", finish);
    try { var p = v.play(); if(p && p.then) p.catch(function(){ /* ignore */ }); } catch(_){}
    // if no frame in ~300ms, fall back to onDone (some browsers block autoplay)
    setTimeout(function(){ if (v.currentTime === 0) finish(); }, 300);
  }

  function boot(){
    var st = stage(), cfg = parseCfg();
    if(!st || !cfg || !(cfg.video || (cfg.slides && cfg.slides.length))) return false;

    var slides = cfg.slides || [], idx = 0, interval = Math.max(1000, +cfg.interval || 4000);
    function rotate(){
      if (!slides.length) return; showImg(st, slides[idx]); idx = (idx + 1) % slides.length;
      setTimeout(rotate, interval);
    }

    // poster-first to avoid black box
    if (slides.length) showImg(st, slides[0]);
    if (cfg.video) showVideo(st, cfg.video, rotate); else rotate();
    return true;
  }

  function arm(){
    if (boot()) return;
    var tries=0, t=setInterval(function(){ tries++; if (boot() || tries>25) clearInterval(t); }, 200);
    new MutationObserver(boot).observe(document.documentElement, { childList:true, subtree:true });
    window.addEventListener("pageshow", boot);
    document.addEventListener("visibilitychange", function(){ if(!document.hidden) boot(); });
  }

  (document.readyState === "loading") ? document.addEventListener("DOMContentLoaded", arm) : arm();
})();