/* Press list render (ES5) — populates <ul id="pressList"> on the homepage. */
(function () {
  var listEl = document.getElementById('pressList');
  if (!listEl) return;

  var bases = ['/','./','../',''];
  var i = 0;

  function tryNext() {
    if (i >= bases.length) return Promise.resolve([]);
    var url = bases[i++] + 'assets/press.json?v=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return tryNext(); });
  }

  function fmtDate(s){
    var d = s ? new Date(s) : null;
    return d && !isNaN(d) ? d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '';
  }

  function itemHTML(p) {
    var meta = [p.outlet || '', fmtDate(p.date)].filter(Boolean).join(' · ');
    return '' +
      '<li>' +
        '<a href="' + (p.url || '#') + '" target="_blank" rel="noopener">' +
          (p.title || 'Untitled') +
        '</a>' +
        (meta ? '<div class="meta">' + meta + '</div>' : '') +
      '</li>';
  }

  tryNext().then(function (items) {
    if (!Array.isArray(items) || !items.length) return;

    items.sort(function(a,b){
      var ta = Date.parse(a.date||''); var tb = Date.parse(b.date||'');
      ta = isNaN(ta) ? -Infinity : ta;
      tb = isNaN(tb) ? -Infinity : tb;
      return tb - ta;
    });

    var limAttr = (listEl.getAttribute('data-limit') || '').toLowerCase();
    var limit = limAttr === 'all' ? items.length : parseInt(limAttr, 10);
    if (!limit || limit < 1) limit = 6; // default 6

    listEl.innerHTML = items.slice(0, limit).map(itemHTML).join('');
  });
})();