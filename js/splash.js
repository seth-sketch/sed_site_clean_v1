/* splash.js — optional splash fade (kept tiny in index inline too) */
(function(){
  var s = document.getElementById('splash');
  if(!s) return;
  // To show once per session instead, gate with sessionStorage.
  setTimeout(function(){ s.classList.add('hide'); }, 900);
})();