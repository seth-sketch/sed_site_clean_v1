(function(){
  var s = document.getElementById('splash');
  if(!s) return;
  // Show every load (simple). If you want "once per session", gate with sessionStorage.
  setTimeout(function(){ s.classList.add('hide'); }, 900);
})();