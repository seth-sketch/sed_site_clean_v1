(function () {
  "use strict";
  var PH="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/></svg>";

  function $(s){ return document.querySelector(s); }
  function pick(a){ for (var i=0;i<a.length;i++){ var el=$(a[i]); if(el) return el; } return null; }

  function getSlug(){
    var s=null;
    if(location.search.indexOf("slug=")!==-1){
      var q=location.search.slice(1).split("&");
      for(var i=0;i<q.length;i++){
        var kv=q[i].split("=");
        if(decodeURIComponent(kv[0])==="slug"){
          s=decodeURIComponent(kv[1]||"").trim(); break;
        }
      }
    }
    if(!s){
      // also allow /work/slug.html style URLs, just in case
      var m = location.pathname.match(/\/work\/([^\/]+)\.html$/);
      s = m? m[1] : null;
    }
    return s;
  }

  function slugify(x){
    return String(x||"").toLowerCase()
      .replace(/[\u2013\u2014]/g,"-")    // em/en dashes → hyphen
      .replace(/[^a-z0-9]+/g,"-")       // non-alnum → hyphen
      .replace(/^-+|-+$/g,"");          // trim hyphens
  }

  function j(u){ return fetch(u,{cache:"no-store"}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function load(cb){
    var bases=["/assets/work.json","./assets/work.json","../assets/work.json"];
    (function next(i){ if(i>=bases.length) return cb([]); j(bases[i]+"?v="+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); }); })(0);
  }

  function ratio(src){ return '<span class="ratio-169"><img src="'+(src||PH)+'" alt=""></span>'; }
  function findThumb(el){ while(el && el!==document.body){ if(el.classList && el.classList.contains("thumb")) return el; el=el.parentNode; } return null; }

  function normalize(list){
    for (var i=0;i<list.length;i++){
      var it=list[i];
      if (it.cover && it.cover.charAt(0)!="/") it.cover="/"+it.cover.replace(/^\/+/,"");
      if (it.gallery && it.gallery.length){
        for (var g=0; g<it.gallery.length; g++){
          var p=it.gallery[g];
          it.gallery[g] = (p.charAt(0)==="/" ? p : "/"+p.replace(/^\/+/,""));
        }
      }
    }
    return list;
  }

  function pickItem(list, want){
    if(!list || !list.length) return { item:null, idx:0 };
    var q = slugify(want||"");
    for (var i=0;i<list.length;i++){
      if (slugify(list[i].slug)===q || slugify(list[i].title)===q) return { item:list[i], idx:i };
    }
    // safe fallback so the page doesn't look broken
    return { item:list[0], idx:0 };
  }

  function render(item, idx, list){
    var hero   = pick(['[data-project="hero"]','#projectHero','.project-hero']);
    var title  = pick(['[data-project="title"]','h1','.project-title']);
    var meta   = pick(['[data-project="meta"]','.project-meta']);
    var thumbs = pick(['[data-project="thumbs"]','#projectThumbs','.project-thumbs']);

    if (title) title.textContent = (item && item.title) || "Project";
    if (meta)  meta.textContent  = item ? [item.client,item.year,item.role].filter(Boolean).join(" · ") : "";

    var firstSrc = item && (item.cover || (item.gallery && item.gallery[0]));
    if (hero)  hero.innerHTML    = ratio(firstSrc);

    if (thumbs && item && item.gallery && item.gallery.length){
      var t=""; for (var g=0; g<item.gallery.length; g++)
        t+='<button class="thumb" data-src="'+item.gallery[g]+'"><img loading="lazy" src="'+item.gallery[g]+'" alt=""></button>';
      thumbs.innerHTML = t;
      thumbs.addEventListener("click", function(e){
        var btn = findThumb(e.target); if(!btn) return;
        var src = btn.getAttribute("data-src");
        if (hero) hero.innerHTML = ratio(src);
        try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch(_) { window.scrollTo(0,0); }
      });
    } else if (thumbs){ thumbs.innerHTML=""; }

    var back = pick(['[data-project="back"]','.project-back']); if (back) back.href="/work/";

    var next = pick(['[data-project="next"]','.project-next']);
    if (next && list && list.length){
      var n = list[(idx+1)%list.length];
      next.href = n.slug ? ("/project?slug="+encodeURIComponent(n.slug)) : "/work/";
      var s = next.querySelector("span"); if (s) s.textContent = n.title || "Next project";
    }

    document.addEventListener("error", function(e){
      var img=e.target && e.target.tagName==="IMG" ? e.target : null;
      if (!img) return; img.src = PH; img.setAttribute("data-ph","1");
    }, true);
  }

  function init(){
    var want = getSlug(); if(!want) return;
    load(function(list){
      list = normalize(Array.isArray(list)?list:[]);
      var sel = pickItem(list, want);
      render(sel.item, sel.idx, list);
    });
  }

  (document.readyState==="loading") ? document.addEventListener("DOMContentLoaded", init) : init();
})();