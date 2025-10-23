(function(){
  var v = document.getElementById('heroVideo');
  if(!v) return;
  v.loop = true;
  function tryPlay(){ var p; try { p = v.play(); } catch(e){} if (p && p.then) p.catch(function(){}); }
  v.addEventListener('ended', function(){ try { v.currentTime = 0; } catch(e){} tryPlay(); });
  v.addEventListener('loadeddata', tryPlay);
  v.addEventListener('canplay', tryPlay);
  window.addEventListener('pageshow', tryPlay);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tryPlay(); });
  tryPlay();
})();