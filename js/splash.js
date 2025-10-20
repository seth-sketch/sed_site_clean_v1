(function(){
  var s = document.getElementById('splash');
  if (!s) return;
  window.addEventListener('load', function(){
    setTimeout(function(){ s.classList.add('is-hidden'); }, 400);
  });
})();