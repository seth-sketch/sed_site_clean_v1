(function(){
  var grid = document.getElementById('grid');
  if (!grid) return;

  var inline = document.getElementById('workData');
  var items = [];
  if (inline) {
    try { items = JSON.parse(inline.textContent || inline.innerText || '[]'); } catch(e){}
  }

  function cardHTML(i){
    return (
      '<article class="card">'+
        '<a class="cover" href="'+ i.href +'">'+
          '<span class="ratio-169"><img src="'+ i.img +'" alt=""></span>'+
        '</a>'+
        '<div class="footer">'+
          '<a href="'+ i.href +'">'+ i.title +'</a>'+
          '<div class="meta">'+ (i.meta||'') +'</div>'+
        '</div>'+
      '</article>'
    );
  }

  grid.innerHTML = items.map(cardHTML).join('');
})();