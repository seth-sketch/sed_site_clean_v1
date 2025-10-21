(function(){
  var host = document.getElementById('pressHome');
  if (!host) return;

  function xhrJSON(url, cb){
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
  }

  function row(p){
    var icon = 'https://www.google.com/s2/favicons?sz=64&domain_url=' + encodeURIComponent(p.url);
    return ''+
      '<a class="press-card" href="'+p.url+'" target="_blank" rel="noopener">'+
        '<div class="thumb"><span class="ratio-169"><img src="'+icon+'" alt=""></span></div>'+
        '<div><div><strong>'+ (p.title || p.source || 'Press') +'</strong></div>'+
        '<div class="meta">'+ (p.source || '') +'</div></div>'+
      '</a>';
  }

  xhrJSON('/assets/press.json?v='+Date.now(), function(list){
    if (!list || !list.length){ host.innerHTML = '<div class="meta">No press yet.</div>'; return; }
    host.innerHTML = list.slice(0,6).map(row).join('');
  });
})();