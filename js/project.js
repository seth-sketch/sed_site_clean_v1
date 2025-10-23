/* project.js (defensive) — slug routing + 16:9 hero + placeholder fallback */
(function(){"use strict";
  var PLACEHOLDER="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'><rect width='16' height='9' fill='%23f0f0f0'/><path d='M0 9 L6 3 L10 7 L13 5 L16 9Z' fill='%23d0d0d0'/><circle cx='4' cy='3' r='1' fill='%23c0c0c0'/><text x='8' y='5' dominant-baseline='middle' text-anchor='middle' font-size='1.2' fill='%23999'>16:9</text></svg>";
  function $(sel){ return document.querySelector(sel); }
  function first(selArr){ for(var i=0;i<selArr.length;i++){ var el=$(selArr[i]); if(el) return el; } return null; }
  function getSlug(){
    var s=null;
    if(location.search.indexOf('slug=')!==-1){
      var q=location.search.slice(1).split('&');
      for(var i=0;i<q.length;i++){ var kv=q[i].split('='); if(decodeURIComponent(kv[0])==='slug'){ s=decodeURIComponent(kv[1]||'').trim(); break; } }
    }
    if(!s){ var m=location.pathname.match(/\/work\/([^\/]+)\.html$/); s=m?m[1]:null; }
    return s;
  }
  function tryFetch(url){ return fetch(url,{cache:'no-store'}).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadWork(cb){
    var bases=['/assets/work.json','./assets/work.json','../assets/work.json'];
    (function next(i){ if(i>=bases.length) return cb([]);
      tryFetch(bases[i]+'?v='+Date.now()).then(function(d){ cb(Array.isArray(d)?d:[]); }).catch(function(){ next(i+1); });
    })(0);
  }
  function setHTML(el, html){ if(el) el.innerHTML=html; }
  function setText(el, txt){ if(el) el.textContent=txt; }
  function imgHTML(src){ return '<span class="ratio-169"><img src="'+(src||PLACEHOLDER)+'" alt=""></span>'; }
  function attachFallback(root){
    root.addEventListener('error', function(e){
      var img=e.target && e.target.tagName==='IMG' ? e.target : null;
      if(!img) return;
      if(img.src.indexOf('data:image/svg+xml')===-1) img.src=PLACEHOLDER;
      img.setAttribute('data-ph','1');
    }, true);
  }
  function render(item, idx, list){
    var hero=first(['[data-project=\"hero\"]','#projectHero','.project-hero']); 
    var titleEl=first(['[data-project=\"title\"]','h1','.project-title']);
    var metaEl=first(['[data-project=\"meta\"]','.project-meta']);
    var thumbs=first(['[data-project=\"thumbs\"]','#projectThumbs','.project-thumbs']);

    setText(titleEl, (item && item.title) || 'Project');
    setText(metaEl, item ? [item.client,item.year,item.role].filter(Boolean).join(' · ') : '');
    setHTML(hero, imgHTML(item && (item.cover || (item.gallery&&item.gallery[0]))));

    if(thumbs && item && item.gallery && item.gallery.length){
      var t=''; for(var g=0; g<item.gallery.length; g++) t+='<button class="thumb" data-src="'+item.gallery[g]+'"><img loading="lazy" src="'+item.gallery[g]+'" alt=""></button>';
      thumbs.innerHTML=t;
      thumbs.addEventListener('click', function(e){
        var btn=e.target && (e.target.closest?e.target.closest('.thumb'):null);
        if(!btn) return;
        var src=btn.getAttribute('data-src');
        setHTML(hero, imgHTML(src));
        try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(_){}
      });
    } else if(thumbs) thumbs.innerHTML='';

    var back=first(['[data-project=\"back\"]','.project-back']); if(back) back.href='/';

    var next=first(['[data-project=\"next\"]','.project-next']); 
    if(next && list && list.length){ var n=list[(idx+1)%list.length]; next.href=n.slug?('/project?slug='+encodeURIComponent(n.slug)):'/'; var s=next.querySelector('span'); if(s) s.textContent=n.title||'Next project'; }

    attachFallback(document);
  }
  function normalize(list){
    for(var i=0;i<list.length;i++){
      var it=list[i];
      if(it.cover && it.cover.charAt(0)!=='/') it.cover='/'+it.cover.replace(/^\/+/,'');
      if(it.gallery&&it.gallery.length) for(var j=0;j<it.gallery.length;j++){
        var s=it.gallery[j]; it.gallery[j]=(s.charAt(0)==='/'?s:'/'+s.replace(/^\/+/,'')); 
      }
    }
    return list;
  }
  function init(){
    var slug=getSlug(); if(!slug) return;
    loadWork(function(list){
      list=normalize(Array.isArray(list)?list:[]);
      var idx=0, found=null;
      for(var k=0;k<list.length;k++) if(list[k].slug===slug){ idx=k; found=list[k]; break; }
      render(found||list[0]||null, idx, list);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();