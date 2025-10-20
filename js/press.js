/* Press loader — fills #pressList (press page) and #pressListHome (home) */
(function(){
  function $(s){ return document.querySelector(s); }

  function loadPress(){
    var bases = ['', './', '../', '/'];
    var i = 0;
    function tryNext(){
      if (i >= bases.length) return Promise.resolve([]);
      var url = bases[i++] + 'assets/press.json?v=' + Date.now();
      return fetch(url, { cache:'no-store' })
        .then(function(r){ if (!r.ok) throw 0; return r.json(); })
        .catch(function(){ return tryNext(); });
    }
    return tryNext();
  }

  function one(item){
    var thumb = item.thumb || '';
    var img = thumb
      ? '<span class="thumb"><span class="ratio-169"><img src="'+thumb+'" alt=""></span></span>'
      : '<span class="thumb"><span class="ratio-169"></span></span>';
    var meta = [item.source, item.date].filter(Boolean).join(' · ');
    return '<a class="press-card" href="'+item.url+'" target="_blank" rel="noopener">'+
             img +
             '<span class="text"><strong>'+ (item.title||'') +'</strong>'+
             '<div class="meta">'+ meta +'</div></span>'+
           '</a>';
  }

  loadPress().then(function(list){
    if (!Array.isArray(list) || !list.length) return;

    // Home (first 6)
    var home = $('#pressListHome');
    if (home){
      var cut = list.slice(0, 6).map(one).join('');
      home.innerHTML = '<li style="grid-column:1/-1; display:none;"></li>' + // keeps UL valid
                       list.slice(0, 6).map(function(it){ return '<li>'+one(it)+'</li>'; }).join('');
    }

    // Press page (all)
    var page = $('#pressList');
    if (page){
      page.innerHTML = '<li style="grid-column:1/-1; display:none;"></li>' +
                       list.map(function(it){ return '<li>'+one(it)+'</li>'; }).join('');
    }
  });
})();