/* Full press page: render all items with favicon+title+source */
(function(){
  var grid = document.getElementById('pressGrid');
  if (!grid) return;

  function xhrJSON(url, cb){
    try{
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.onreadystatechange = function(){
        if (x.readyState === 4){
          if (x.status >= 200 && x.status < 300){
            try { cb(JSON.parse(x.responseText)); } catch(e){ cb([]); }
          } else { cb([]); }
        }
      };
      x.send();
    }catch(_){ cb([]); }
  }

  function card(p){
    var icon = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(p.url);
    return '' +
      '<article class="card">' +
        '<a class="cover" href="'+p.url+'" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img src="'+icon+'" alt=""></span>' +
        '</a>' +
        '<div class="footer">' +
          '<a href="'+p.url+'" target="_blank" rel="noopener">'+(p.title||p.source)+'</a>' +
          '<div class="meta">'+(p.source||'')+'</div>' +
        '</div>' +
      '</article>';
  }

  xhrJSON('../assets/press.json?v='+Date.now(), function(list){
    if(!list || !list.length){ grid.innerHTML = '<div class="meta">No press yet.</div>'; return; }
    var html = '';
    for (var i=0;i<list.length;i++) html += card(list[i]);
    grid.innerHTML = html;
  });
})();// JavaScript Document