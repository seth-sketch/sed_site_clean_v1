(function(){
  'use strict';
  if (window.__PROJ_TABS__) return; window.__PROJ_TABS__=true;

  const qp = new URLSearchParams(location.search);
  const slug = (qp.get('slug')||'').trim();

  const el = sel => document.querySelector(sel);
  const fix = p => !p ? p : (/^https?:\/\//i.test(p) || p.startsWith('/')) ? p : '/'+p.replace(/^\/+/,'');
  const getJSON = async (u) => {
    const r = await fetch(u+(u.includes('?')?'&':'?')+'v='+Date.now(), {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP '+r.status);
    return r.json();
  };

  const t = el('#projTitle'), m = el('#projMeta'), d = el('#projDesc');
  const viewer = el('#projViewer'), strip = el('#projStrip');
  const tabsBar = document.createElement('nav'); tabsBar.id='projTabs';
  const panelHost = document.createElement('section'); panelHost.id='projPanel';
  const shell = el('#project-shell');
  shell.insertBefore(tabsBar, viewer);
  shell.insertBefore(panelHost, d);

  function mountMedia(item, media){
    viewer.innerHTML='';
    strip.innerHTML='';
    if (!media || !media.length) return;

    const open = (idx)=>{
      const mm = media[idx];
      viewer.innerHTML='';
      viewer.appendChild(mm.type==='video'
        ? Object.assign(document.createElement('video'),{src:mm.src,controls:true,playsinline:true})
        : Object.assign(document.createElement('img'),{src:mm.src,alt:item.title||''})
      );
      [...strip.children].forEach((im,i)=>im.classList.toggle('active', i===idx));
      viewer.onclick = ()=> openLightbox(idx);
    };

    media.forEach((mm,i)=>{
      const thumbSrc = mm.type==='image'? mm.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const im = Object.assign(document.createElement('img'),{src:thumbSrc,alt:'thumb'});
      if(i===0) im.classList.add('active');
      im.addEventListener('click',()=>open(i));
      strip.appendChild(im);
    });
    open(0);

    function openLightbox(start){
      let idx=start;
      const wrap=document.createElement('div'); wrap.id='lbV3'; wrap.className='open';
      wrap.innerHTML='<div class="main"><button class="prev">‹</button><div id="lbV3c"></div><button class="next">›</button><button class="x">✕</button></div><div class="strip" id="lbV3s"></div>';
      document.body.appendChild(wrap);
      const lbc=wrap.querySelector('#lbV3c'), lbs=wrap.querySelector('#lbV3s');
      const render=(i)=>{
        const mm=media[i]; lbc.innerHTML='';
        lbc.appendChild(mm.type==='video'
          ? Object.assign(document.createElement('video'),{src:mm.src,controls:true,playsinline:true})
          : Object.assign(document.createElement('img'),{src:mm.src,alt:item.title||''})
        );
        lbs.innerHTML='';
        media.forEach((mm2,j)=>{
          const ts=mm2.type==='image'?mm2.src:
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
          const im=Object.assign(document.createElement('img'),{src:ts}); if(j===i) im.classList.add('active'); im.onclick=()=>render(j); lbs.appendChild(im);
        });
      };
      render(idx);
      wrap.querySelector('.x').onclick=()=>wrap.remove();
      wrap.querySelector('.prev').onclick=()=>{ idx=(idx-1+media.length)%media.length; render(idx); };
      wrap.querySelector('.next').onclick=()=>{ idx=(idx+1)%media.length; render(idx); };
      wrap.onclick=e=>{ if(e.target===wrap) wrap.remove(); };
    }
  }

  function clearPanels(){ panelHost.innerHTML=''; tabsBar.innerHTML=''; }

  function addTab(label, renderFn){
    const id = 'tab-'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const btn = Object.assign(document.createElement('button'), {className:'tab', textContent:label});
    const panel = Object.assign(document.createElement('div'), {className:'panel', id});
    tabsBar.appendChild(btn); panelHost.appendChild(panel);
    btn.addEventListener('click', ()=>{
      [...tabsBar.children].forEach(b=>b.classList.remove('active'));
      [...panelHost.children].forEach(p=>p.classList.remove('active'));
      btn.classList.add('active'); panel.classList.add('active');
      renderFn(panel);
    });
    return {btn, panel};
  }

  (async function(){
    let list=[]; try{ list = await getJSON('/assets/work.json'); }catch(e){ console.error(e); return; }
    if(!Array.isArray(list)) return;

    // normalize
    const items = list.map((raw,i)=>{
      const gallery = Array.isArray(raw.gallery)? raw.gallery.map(fix) : [];
      const media = Array.isArray(raw.media)&&raw.media.length
        ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)}))
        : gallery.map(src=>({type:'image',src}));
      return {
        id: raw.id || raw.slug || `item-${i+1}`,
        slug: (raw.slug||raw.id||'').trim(),
        title: raw.title || '', client: raw.client || '', role: raw.role || '', year: raw.year || '',
        description: raw.description || '',
        media,
        tabs: Array.isArray(raw.tabs) ? raw.tabs : null
      };
    });

    let item = items.find(x=> x.slug===slug || x.id===slug) || items[0];
    if(!item) return;

    // header/meta
    t.textContent = item.title || 'Project';
    m.textContent = [item.role, item.client, item.year].filter(Boolean).join(' • ');
    d.textContent = item.description || '';

    clearPanels();

    if (item.tabs && item.tabs.length){
      // Build tabs from config
      item.tabs.forEach(tab=>{
        const type=(tab.type||'media').toLowerCase();
        if (type==='media'){
          const media = (tab.media && tab.media.length) ? tab.media.map(x=>({type:'image',src:fix(x)})) : item.media;
          const {btn,panel} = addTab(tab.label||'Renderings', (mount)=>{ viewer.style.display=''; strip.style.display=''; panel.innerHTML=''; mountMedia(item, media); });
          if (!tabsBar.querySelector('.tab.active')) btn.click();
        } else if (type==='files'){
          const files = Array.isArray(tab.files)? tab.files : [];
          addTab(tab.label||'Files', (panel)=>{
            viewer.style.display='none'; strip.style.display='none';
            panel.innerHTML='';
            const list=document.createElement('div'); list.className='files-list';
            files.forEach(f=>{
  const a=document.createElement('a');
  const href = fix(f.href || '');
  a.href = "#";
  a.innerHTML = `<strong>${f.label || 'View File'}</strong> <small>${(f.note || '')}</small>`;
  a.addEventListener('click', e => {
    e.preventDefault();
    openAssetOverlay(href);
  });
  list.appendChild(a);
});
            panel.appendChild(list);
          });
       } else if (type==='files'){
  const files = Array.isArray(tab.files)? tab.files : [];
  addTab(tab.label||'Files', (panel)=>{
    viewer.style.display='none'; strip.style.display='none';
    panel.innerHTML='';
    const list=document.createElement('div'); list.className='files-list';
    files.forEach(f=>{
      const a=document.createElement('a');
      const href = fix(f.href || '');
      a.href = "#";
      a.innerHTML = `<strong>${f.label || 'View File'}</strong> <small>${(f.note || '')}</small>`;
      a.addEventListener('click', e => {
        e.preventDefault();
        openAssetOverlay(href);
      });
      list.appendChild(a);
    });
    panel.appendChild(list);
  });
    } else {
      // No tabs provided → classic single "Renderings" view
      viewer.style.display=''; strip.style.display='';
      mountMedia(item, item.media);
    }
		  function openAssetOverlay(href) {
  const overlay = document.getElementById('assetOverlay');
  const pdfFrame = document.getElementById('pdfFrame');
  const modelViewer = document.getElementById('modelViewer');
  const msg = document.getElementById('assetMessage');

  overlay.classList.add('visible');
  pdfFrame.hidden = modelViewer.hidden = msg.hidden = true;

  if (href.match(/\.(pdf)$/i)) {
    pdfFrame.src = href;
    pdfFrame.hidden = false;
  } else if (href.match(/\.(glb|gltf|obj|usdz)$/i)) {
    modelViewer.src = href;
    modelViewer.hidden = false;
  } else {
    msg.textContent = "Unsupported format";
    msg.hidden = false;
  }
}

document.getElementById('assetCloseBtn').onclick = () => {
  const overlay = document.getElementById('assetOverlay');
  const pdfFrame = document.getElementById('pdfFrame');
  const modelViewer = document.getElementById('modelViewer');
  pdfFrame.src = "";
  modelViewer.src = "";
  overlay.classList.remove('visible');
};
  })();
})();// JavaScript Document