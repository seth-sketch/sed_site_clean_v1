(function(){
  const stage = document.querySelector('.se-slide-stage');
  if(!stage) return;
  let slides = [];
  try{ slides = JSON.parse(document.getElementById('seSlidesJSON').textContent); }catch(e){}
  const imgs = slides.map((src,i)=>{
    const img = new Image(); img.src = src; if(i===0) img.classList.add('active');
    stage.appendChild(img); return img;
  });
  let active = 0;
  setInterval(()=>{
    if(imgs.length<2) return;
    imgs[active].classList.remove('active');
    active = (active+1) % imgs.length;
    imgs[active].classList.add('active');
  }, 4000);
})();