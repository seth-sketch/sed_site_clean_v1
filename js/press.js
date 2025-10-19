
(function(){
  var grid = document.getElementById('pressGrid');
  if (!grid) return;

  function getJSON(){
    var paths = ['../assets/press.json', '../js/press.json', '/assets/press.json'];
    var i = 0;
    function next(){
      if (i >= paths.length) return Promise.resolve([]);
      var url = paths[i++] + '?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return next(); });
    }
    return next();
  }

  function siteIcon(url){
    try{ var u = new URL(url); return 'https://www.google.com/s2/favicons?domain=' + u.hostname + '&sz=128'; }
    catch(e){ return ''; }
  }

  function card(p){
    var img = p.image || siteIcon(p.url);
    var host = '';
    try{ host = new URL(p.url).hostname.replace('www.',''); }catch(e){}
    return ''+
      '<article class="card">'+
        '<a class="cover" target="_blank" rel="noopener" href="'+p.url+'">'+
          '<span class="ratio-169">'+ (img ? '<img src="'+img+'" alt="">' : '') +'</span>'+
        '</a>'+
        '<div class="footer">'+
          '<a target="_blank" rel="noopener" href="'+p.url+'">'+(p.title||'Press item')+'</a>'+
          '<div class="meta">'+ (p.source || host || '') + (p.date? ' · '+p.date : '') +'</div>'+
        '</div>'+
      '</article>';
  }

  getJSON().then(function(list){
    if (!Array.isArray(list)) list = (list.items || []);
    grid.innerHTML = list.map(card).join('');
  });
})();
