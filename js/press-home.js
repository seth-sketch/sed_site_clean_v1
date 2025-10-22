/* /js/press-home.js — renders first 6 press items into #pressHome. ES5, absolute paths. */
(function () {
  var host = document.getElementById('pressHome');
  if (!host) return;

  function esc(s){ return (s||'').replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function one(p){
    var url   = p.url || '#';
    var title = esc(p.title || '');
    var src   = p.thumb || '/assets/work/placeholder-16x9.jpg';
    var meta  = [p.source || '', p.date || ''].filter(Boolean).join(' · ');
    return '' +
      '<li class="press-item">' +
        '<a class="thumb" href="' + url + '" target="_blank" rel="noopener">' +
          '<span class="ratio-169"><img src="' + src + '" alt=""></span>' +
        '</a>' +
        '<div>' +
          '<a href="' + url + '" target="_blank" rel="noopener">' + title + '</a>' +
          '<div class="meta">' + esc(meta) + '</div>' +
        '</div>' +
      '</li>';
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/assets/press.json?' + Date.now(), true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        var list = [];
        try { list = JSON.parse(xhr.responseText) || []; } catch (e) {}
        var html = '';
        for (var i = 0; i < list.length && i < 6; i++) html += one(list[i]);
        host.innerHTML = html;
      }
    }
  };
  xhr.send();
})();