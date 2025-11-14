// /js/splash.js  — keeps splash for ~1.7s then guarantees hide
(function () {
  "use strict";
  var splash = document.querySelector(".splash");
  if (!splash) return;

  // Quick debug kill-switch: add ?nosplash=1 to the URL
  if (/\bnosplash=1\b/.test(location.search)) {
    splash.classList.add("hide");
    return;
  }

  var MIN_SHOW_MS = 1700;  // ~1.7s minimum visible time
  var HARD_KILL_MS = 5000; // absolute max, just in case
  var t0 = performance.now();

  function hideNow() {
    if (!splash || splash.classList.contains("hide")) return;
    splash.classList.add("hide");
  }

  function scheduleHide() {
    var elapsed = performance.now() - t0;
    var wait = Math.max(0, MIN_SHOW_MS - elapsed);
    setTimeout(hideNow, wait);
    // Absolute safety: even if something blocks, force-hide at HARD_KILL_MS
    setTimeout(hideNow, Math.max(wait, HARD_KILL_MS));
  }

  // Primary: as soon as DOM is ready, start the timer
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleHide);
  } else {
    scheduleHide();
  }

  // Extra belts-and-suspenders: also hide on load & on any media error
  window.addEventListener("load", hideNow, { once: true });
  document.addEventListener("error", hideNow, true);

  // And let users click to dismiss if it ever lingers
  splash.addEventListener("click", hideNow);
})();