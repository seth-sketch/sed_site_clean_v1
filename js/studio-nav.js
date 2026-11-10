/* Studio header menu toggle (subpages) */
(function () {
  var menu = document.querySelector(".s-menu"), links = document.getElementById("navLinks");
  if (!menu || !links) return;
  menu.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", open ? "true" : "false");
  });
  var yr = document.getElementById("yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
