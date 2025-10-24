// js/home-copy.js
(function () {
  "use strict";

  function $(s, scope) { return (scope || document).querySelector(s); }

  function fetchJSON(urls, cb) {
    (function next(i){
      if (i >= urls.length) return cb(null);
      fetch(urls[i] + "?v=" + Date.now(), { cache: "no-store" })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(d => cb(d))
        .catch(() => next(i + 1));
    })(0);
  }

  function render(data) {
    var sec = $('.hero-copy-card'); if (!sec) return;
    var mount = $('#heroCopy', sec);
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'heroCopy';
      sec.appendChild(mount);
    }

    // If you set hero_title in JSON, it will override the H1
    if (data && data.hero_title) {
      var h1 = $('.hero-copy-card h1'); if (h1) h1.textContent = data.hero_title;
    }

    var copy = (data && data.copy) || [
      "Broadcast & Live Event Production Design.",
      "Studios and stages for ABC News and beyond — Good Morning America, World News Tonight, This Week, The View, Presidential Debates, and Election coverage in studio and across the Nation.",
      "Seth Easter designs broadcast studios and live-event productions worldwide and is based in NYC. Multiple Emmys & an ADG award for work at ABC News and beyond."
    ];

    var html = "";
    for (var i = 0; i < copy.length; i++) {
      var cls = i === 0 ? "lead" : "";
      html += '<p class="'+cls+'">'+ copy[i] +'</p>';
    }
    mount.innerHTML = html;
  }

  function init(){
    fetchJSON(["/assets/home.json","./assets/home.json","../assets/home.json"], render);
  }

  (document.readyState === "loading")
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();// JavaScript Document