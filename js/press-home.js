/* Renders top 6 on home (#pressHome) and full list on /press (#pressPage) */
(function(){
  function loadPress(){
    var urls = ['/assets/press.json?v='+Date.now(), '../assets/press.json?v='+Date.now(), '/press/assets/press.json?v='+Date.now()];
    var i = 0;
    function next(){
      if (i >= urls.length) return Promise.resolve([]);
      return fetch(urls[i++], { cache:'no-store' })
        .then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .catch(function(){ return next(); });
    }
    return next();
  }
  function card(p){
    var tn = p.thumbnail || '/assets/press/press-placeholder.jpg';
    return '' +
      '<li class="press-item">' +
        '<div class="thumb"><span class="ratio-169"><img src="'+tn+'" alt=""></span></div>' +
        '<div>' +
          '<a href="'+p.url+'" target="_blank" rel="noopener">'+(p.title||'Press')+'</a>' +
          '<div class="meta">'+[p.source, p.date].filter(Boolean).join(' · ')+'</div>' +
        '</div>' +
      '</li>';
  }

  loadPress().then(function(list){
    if (!Array.isArray(list)) list = [];
    var home = document.getElementById('pressHome');
    var page = document.getElementById('pressPage');

    if (home){
      home.innerHTML = list.slice(0,6).map(card).join('');
    }
    if (page){
      page.innerHTML = list.map(card).join('');
    }
  });
})();