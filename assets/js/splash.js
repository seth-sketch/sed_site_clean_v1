(function(){
  var s = document.getElementById('splash');
  if (!s) return;
  if (sessionStorage.getItem('sedSplash') === '1'){
    s.parentNode.removeChild(s); return;
  }
  setTimeout(function(){
    s.classList.add('fade');
    setTimeout(function(){ if (s && s.parentNode) s.parentNode.removeChild(s); }, 600);
  }, 1200);
  sessionStorage.setItem('sedSplash','1');
})();
