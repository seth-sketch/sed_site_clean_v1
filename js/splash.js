(function(){
  var MIN = 1700; // keep splash ~1.7s
  var start = Date.now();
  function hideNow(){ var s=document.getElementById('splash'); if(!s) return; s.classList.add('hide'); setTimeout(function(){ s.remove && s.remove(); }, 450); }
  function maybeHide(){ var wait = Math.max(0, MIN - (Date.now() - start)); setTimeout(hideNow, wait); }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', maybeHide); }
  else { maybeHide(); }
})();