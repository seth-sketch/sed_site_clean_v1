/* Press list render (ES5) — populates <ul id="pressList"> on the homepage. */
(function () {
  var listEl = document.getElementById('pressList');
  if (!listEl) return;

  // try multiple bases so it works on / and /press/
  var bases = ['', './', '../', '/'];
  var i = 0;

  function tryNext() {
    if (i >= bases.length) return Promise.resolve([]);
    var url = bases[i++] + 'assets/press.json?v=' + Date.now();
    return fetch(url, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .catch(function () { return tryNext(); });
  }

  function itemHTML(p) {
    var d = p.date ? new Date(p.date).toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'}) : '';
    var meta = [p.outlet || '', d].filter(Boolean).join(' · ');
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

    // Sort newest first
    items.sort(function(a,b){
      return (new Date(b.date||'1970-01-01')) - (new Date(a.date||'1970-01-01'));
    });

    // Show first N (default 6, override with data-limit="N")
    var limitAttr = listEl.getAttribute('data-limit');
    var limit = limitAttr ? parseInt(limitAttr, 10) : 6;

    listEl.innerHTML = items.slice(0, limit).map(itemHTML).join('');
  });
})();// JavaScript Document