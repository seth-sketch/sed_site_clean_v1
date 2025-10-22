/* press-home.js — renders press teasers on home and full list on /press */
(function(){
  function loadPress(cb){
    var url = '/assets/press.json?v=' + Date.now();
    fetch(url, { cache:'no-store' })
      .then(function(r){ if(!r.ok) throw 0; return r.json(); })
      .then(function(d){ cb(Array.isArray(d)?d:[]); })
      .catch(function(){ cb([]); });
  }
  function itemHTML(p){
    var u = p.url || '#';
    var t = p.title || 'Press';
    var o = p.outlet || '';
    var d = p.date || '';
    var img = p.thumb || '/assets/work/placeholder-16x9.jpg';
    return ''+
      '<li class="press-item">' +
        '<a class="thumb" href="'+u+'" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img src="'+img+'" alt=""></span>' +
        '</a>' +
        '<div>' +
          '<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>' +
          '<div class="meta">'+[o,d].filter(Boolean).join(' · ')+'</div>' +
        '</div>' +
      '</li>';
  }

  loadPress(function(list){
    // home (first 6)
    var home = document.getElementById('pressHome');
    if (home){
      var n = Math.min(6, list.length);
      var html = '';
      for (var i=0;i<n;i++) html += itemHTML(list[i]);
      home.innerHTML = html;
    }
    // press page (all)
    var grid = document.getElementById('pressGrid');
    if (grid){
      var all = '';
      for (var j=0;j<list.length;j++) all += itemHTML(list[j]);
      grid.innerHTML = all;
    }
  });
})();