/* Seth Easter Design — studio home behaviour */
(function () {
  "use strict";
  var GRID_MAX = 9;
  var FEATURED = "gma-2025";

  // Sector per project (kept here so work.json and other pages stay untouched)
  var SECTOR = {
    "beyonce-4th-of-july-statue-of-liberty-2011": "Live event",
    "gma-taylor-swift-1989": "Live event",
    "abc-debate-stage": "Live event",
    "election-roadset": "Live event",
    "oscars-red-carpet-abc": "Live event",
    "ted-ed-bam": "Live event",
    "ted-live-town-hall": "Live event",
    "gma-alicia-keys-drive-in": "Live event",
    "bloomberg-screentime": "Brand experience",
    "paramount-4d-ride": "Brand experience"
  };
  // Order for the home grid (anything else follows in work.json order)
  var ORDER = ["abc-debate-stage", "election-2024", "world-news-tonight", "the-view-refresh",
    "beyonce-4th-of-july-statue-of-liberty-2011", "gma-taylor-swift-1989", "bloomberg-screentime",
    "paramount-4d-ride", "this-week-4e", "ted-live-town-hall", "gma-alicia-keys-drive-in", "oscars-red-carpet-abc"];
  // Cleaner display titles for entries typed in caps
  var TITLE = {
    "newsnation-new-york": "NewsNation Newsroom & Main Studio",
    "bloomberg-screentime": "Bloomberg Screentime — multi-stage activation",
    "paramount-4d-ride": "Paramount 4D ride in a gondola — Super Bowl",
    "led-newsroom-display": "LED art piece for newsroom monitoring",
    "beyonce-4th-of-july-statue-of-liberty-2011": "Beyoncé — 4th of July at the Statue of Liberty",
    "gma-taylor-swift-1989": "Taylor Swift — GMA on Broadway",
    "gma-alicia-keys-drive-in": "Alicia Keys for essential workers — GMA",
    "abc-debate-stage": "ABC Presidential Debate Stage"
  };
  var CLIENT = { "BLOOMBERG - AGENCY": "Bloomberg via agency", "PARAMOUNT - AGENCY": "Paramount via agency", "NEXSTAR": "Nexstar" };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function getJSON(u) {
    return fetch(u, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(u); return r.json(); });
  }

  /* ---------- nav ---------- */
  var menu = document.querySelector(".s-menu"), links = document.getElementById("navLinks");
  if (menu && links) {
    menu.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menu.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) { links.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- work grid ---------- */
  var grid = document.getElementById("workGrid");
  var projects = [], filter = "All";

  function sectorOf(p) { return p.sector || SECTOR[p.slug] || "Broadcast"; }
  function render() {
    if (!grid) return;
    var list = projects.filter(function (p) { return filter === "All" || sectorOf(p) === filter; }).slice(0, GRID_MAX);
    grid.innerHTML = list.map(function (p) {
      var meta = [CLIENT[p.client] || p.client, p.year].filter(Boolean).join(" · ");
      var title = TITLE[p.slug] || p.title;
      return '<a class="s-tile" href="/project/?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="ph"><img loading="lazy" src="' + esc(p.cover) + '" alt="' + esc(title) + '"></div>' +
        '<div class="body"><span class="sector">' + esc(sectorOf(p)) + '</span>' +
        '<h3>' + esc(title) + '</h3>' + (meta ? '<span class="s-meta">' + esc(meta) + '</span>' : '') +
        '</div></a>';
    }).join("");
  }
  var fbtns = document.querySelectorAll(".s-filters button");
  Array.prototype.forEach.call(fbtns, function (b) {
    b.addEventListener("click", function () {
      filter = b.getAttribute("data-f");
      Array.prototype.forEach.call(fbtns, function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      render();
    });
  });

  getJSON("/assets/work.json?v=sed1110").then(function (d) {
    var all = (Array.isArray(d) ? d : (d.items || [])).filter(function (p) { return p.slug && p.cover && p.slug !== FEATURED; });
    all.sort(function (a, b) {
      var ia = ORDER.indexOf(a.slug), ib = ORDER.indexOf(b.slug);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    });
    projects = all;
    var allBtn = document.getElementById("allWork");
    if (allBtn) allBtn.textContent = "All " + (all.length + 1) + " projects →";
    render();
  }).catch(function () { if (grid) grid.innerHTML = '<p class="lede">See all projects on the <a href="/work/">work page</a>.</p>'; });

  /* ---------- awards ---------- */
  getJSON("/assets/awards.json?v=sed1110").then(function (d) {
    var ul = document.getElementById("awardsList"); if (!ul || !Array.isArray(d)) return;
    d.sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
    ul.innerHTML = d.slice(0, 5).map(function (a) {
      var win = /win/i.test(a.result || "");
      return '<li class="s-award"><span class="yr">' + esc(a.year) + '</span><span class="t">' + esc(a.title) +
        (a.result ? ' <span class="r' + (win ? '' : ' nom') + '">' + esc(a.result) + '</span>' : '') + '</span></li>';
    }).join("");
  }).catch(function () {});

  /* ---------- press ---------- */
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function fmt(d) { var m = /^(\d{4})-(\d{2})/.exec(d || ""); return m ? MONTHS[+m[2] - 1] + " " + m[1] : (d || ""); }
  getJSON("/assets/press.json?v=sed1110").then(function (d) {
    var ul = document.getElementById("pressList"); if (!ul || !Array.isArray(d)) return;
    d.sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
    ul.innerHTML = d.slice(0, 4).map(function (p) {
      return '<li><a href="' + esc(p.url || "#") + '" target="_blank" rel="noopener"><span class="t">' + esc(p.title) +
        '</span><span class="s-meta">' + esc([p.outlet || p.source, fmt(p.date)].filter(Boolean).join(" · ")) + '</span></a></li>';
    }).join("");
  }).catch(function () {});

  /* ---------- inquiry form → email ---------- */
  var form = document.getElementById("inquiry"), note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var missing = ["name", "email", "msg"].filter(function (k) { return !String(f[k].value).trim(); });
      if (missing.length || !f.email.checkValidity()) {
        note.textContent = "Please add your name, a valid email and a few details.";
        (f[missing[0]] || f.email).focus();
        return;
      }
      var subject = "Project inquiry — " + f.type.value + (f.company.value ? " — " + f.company.value : "");
      var body = "Name: " + f.name.value + "\nEmail: " + f.email.value + "\nCompany: " + f.company.value +
        "\nProject type: " + f.type.value + "\n\n" + f.msg.value;
      window.location.href = "mailto:info@setheasterdesign.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      note.textContent = "Your email app should open with the message ready to send.";
    });
  }

  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
