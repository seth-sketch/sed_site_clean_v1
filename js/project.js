(function () {
  "use strict";
  var PLACEHOLDER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/></svg>";

  function $(s){ return document.querySelector(s); }
  function first(a){ for(var i=0;i<a.length;i++){ var el=$(a[i]); if(el) return el; } return null; }

  function getSlug(){
    if (location.search.indexOf("slug=") === -1) return null;
    var q = location.search.slice(1).split("&");
    for (var i=0;i<q.length;i++){
      var kv = q[i].split("=");
      if (decodeURIComponent(kv[0]) === "slug")
        return decodeURIComponent((kv[1]||"").trim());
    }
    return null;
  }

  function slugify(s){
    return String(s||"")
      .toLowerCase()
      .replace(/[\u2013\u2014]/g,"-")         // en/em dashes → hyphen
      .replace(/[^a-z0-9]+/g,"-")            // non-alnum → hyphen
      .replace(/^-+|-+$/g,"");               // trim hyphens
  }

  function j(url){ return fetch(url,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadWork(cb){
    var bases=["/assets/work.json","./assets/work.json","../assets/work.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }

  function ratioHTML(src){ return '<span class="ratio-169"><img src="'+(src||PLACEHOLDER)+'" alt=""></span>'; }
  function findThumb(el){ while(el && el!==document.body){ if(el.classList && el.classList.contains("thumb")) return el; el = el.parentNode; } return null; }

  function normalize(list){
    for (var i=0;i<list.length;i++){
      var it=list[i];
      if (it.cover && it.cover.charAt(0)!="/") it.cover="/"+it.cover.replace(/^\/+/,"");
      if (it.gallery && it.gallery.length){
        for (var j=0;j<it.gallery.length;j++){
          var s=it.gallery[j]; it.gallery[j]=(s.charAt(0)==="/" ? s : "/"+s.replace(/^\/+/,""));
        }
      }
    }
    return list;
  }

  function pickItem(w, want){
    if(!w || !w.length) return { item:null, idx:0 };
    var q = slugify(want||"");
    for (var i=0;i<w.length;i++){
      var s1 = slugify(w[i].slug);
      var s2 = slugify(w[i].title);
      if (s1===q || s2===q) return { item:w[i], idx:i };
    }
    // fallback to first
    return { item:w[0], idx:0 };
  }

  function render(item, idx, list){
    var hero   = first(['[data-project="hero"]','#projectHero','.project-hero']);
    var title  = first(['[data-project="title"]','h1','.project-title']);
    var meta   = first(['[data-project="meta"]','.project-meta']);
    var thumbs = first(['[data-project="thumbs"]','#projectThumbs','.project-thumbs']);

    if (title) title.textContent = (item && item.title) || "Project";
    if (meta)  meta.textContent  = item ? [item.client,item.year,item.role].filter(Boolean).join(" · ") : "";

    if (hero)  hero.innerHTML    = ratioHTML(item && (item.cover || (item.gallery && item.gallery[0])));

    if (thumbs && item && item.gallery && item.gallery.length){
      var t=""; for (var g=0; g<item.gallery.length; g++)
        t+='<button class="thumb" data-src="'+item.gallery[g]+'"><img loading="lazy" src="'+item.gallery[g]+'" alt=""></button>';
      thumbs.innerHTML = t;
      thumbs.addEventListener("click", function(e){
        var btn = findThumb(e.target); if(!btn) return;
        var src = btn.getAttribute("data-src");
        if (hero) hero.innerHTML = ratioHTML(src);
        try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch(_) { window.scrollTo(0,0); }
      });
    } else if (thumbs){ thumbs.innerHTML=""; }

    var back = first(['[data-project="back"]','.project-back']); if (back) back.href="/work/";

    var next = first(['[data-project="next"]','.project-next']);
    if (next && list && list.length){
      var n = list[(idx+1)%list.length];
      var s = next.querySelector("span");
      next.href = n.slug ? ("/project.html?slug="+encodeURIComponent(n.slug)) : "/work/";
      if (s) s.textContent = n.title || "Next project";
    }

    document.addEventListener("error", function(e){
      var img = e.target && e.target.tagName==="IMG" ? e.target : null;
      if (!img) return; img.src = PLACEHOLDER; img.setAttribute("data-ph","1");
    }, true);
  }

  function init(){
    var want = getSlug(); if(!want) return;
    loadWork(function(list){
      list = normalize(Array.isArray(list)?list:[]);
      var picked = pickItem(list, want);
      render(picked.item, picked.idx, list);
    });
  }

  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();