/* press-home.js — renders press teasers on home and full list on /press (vanilla ES5) */
(function(){
  function tryFetch(url){ return fetch(url, { cache:'no-store' }).then(function(r){ if(!r.ok) throw 0; return r.json(); }); }
  function loadPress(cb){
    var bases = ['/assets/press.json', './assets/press.json', '../assets/press.json'];
    (function next(i){
      if (i >= bases.length) return cb([]);
      tryFetch(bases[i] + '?v=' + Date.now())
        .then(function(d){ cb(Array.isArray(d)?d:[]); })
        .catch(function(){ next(i+1); });
    })(0);
  }

  function itemHTML(p){
    var u = p.url || '#';
    var t = p.title || 'Press';
    var o = p.outlet || p.source || '';
    var d = p.date || '';
    var img = p.thumb || '/assets/work/placeholder-16x9.jpg';
    return '' +
      '<article class="card">' +
        '<a class="cover" href="'+u+'" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img loading="lazy" src="'+img+'" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+u+'" target="_blank" rel="noopener"><strong>'+t+'</strong></a>' +
          '<div class="meta">'+[o, d].filter(Boolean).join(' · ')+'</div>' +
        '</div>' +
      '</article>';
  }

  document.addEventListener('DOMContentLoaded', function(){
    loadPress(function(list){
      var grid = document.getElementById('pressGrid');
      if (grid){
        var all = '';
        for (var j=0;j<list.length;j++) all += itemHTML(list[j]);
        grid.innerHTML = all;
      }
    });
  });
})();