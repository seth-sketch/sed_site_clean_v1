(function(){
  const stage = document.querySelector('.se-slide-stage');
  if(!stage) return;

  // ensure the inner 16:9 wrapper exists
  let wrap = stage.querySelector('.ratio-169');
  if(!wrap){
    wrap = document.createElement('div');
    wrap.className = 'ratio-169';
    stage.appendChild(wrap);
  }

  // Load slide list from inline JSON
  let slides = [];
  try{
    slides = JSON.parse(document.getElementById('seSlidesJSON').textContent);
  }catch(e){}

  // Create stacked images inside the ratio wrapper
  const imgs = slides.map((src,i)=>{
    const img = new Image();
    img.src = src;
    img.alt = '';
    img.style.opacity = (i===0 ? '1' : '0');
    img.style.transition = 'opacity .6s ease';
    wrap.appendChild(img);
    return img;
  });

  let active = 0;
  setInterval(()=>{
    if(imgs.length < 2) return;
    imgs[active].style.opacity = '0';
    active = (active + 1) % imgs.length;
    imgs[active].style.opacity = '1';
  }, 4000);
})();