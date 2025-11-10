(function(){
  'use strict';
  if (window.__PROJ_TABS__) return;
  window.__PROJ_TABS__ = true;

  const qp = new URLSearchParams(location.search);
  const slug = (qp.get('slug') || '').trim();

  const el = sel => document.querySelector(sel);
  const fix = p => !p ? p : (/^https?:\/\//i.test(p) || p.startsWith('/')) ? p : '/' + p.replace(/^\/+/, '');
  const getJSON = async (u) => {
    const r = await fetch(u + (u.includes('?') ? '&' : '?') + 'v=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  };

  const t = el('#projTitle'), m = el('#projMeta'), d = el('#projDesc');
  const viewer = el('#projViewer'), strip = el('#projStrip');
  const tabsBar = document.createElement('nav'); tabsBar.id = 'projTabs';
  const panelHost = document.createElement('section'); panelHost.id = 'projPanel';
  const shell = el('#project-shell');
  shell.insertBefore(tabsBar, viewer);
  shell.insertBefore(panelHost, d);

  // -------- Overlay handling --------
  function openAssetOverlay(href) {
    const overlay = document.getElementById('assetOverlay');
    const pdfFrame = document.getElementById('pdfFrame');
    const modelViewer = document.getElementById('modelViewer');
    const msg = document.getElementById('assetMessage');
    if (!overlay) return console.warn('Overlay not found');

    overlay.classList.add('visible');
    pdfFrame.hidden = modelViewer.hidden = msg.hidden = true;

    if (href.match(/\.pdf$/i)) {
      pdfFrame.src = href;
      pdfFrame.hidden = false;
    } else if (href.match(/\.(glb|gltf|usdz|obj)$/i)) {
      modelViewer.src = href;
      modelViewer.hidden = false;
    } else {
      msg.textContent = 'Unsupported format';
      msg.hidden = false;
    }
  }

  const closeBtn = document.getElementById('assetCloseBtn');
  if (closeBtn) closeBtn.onclick = () => {
    const overlay = document.getElementById('assetOverlay');
    const pdfFrame = document.getElementById('pdfFrame');
    const modelViewer = document.getElementById('modelViewer');
    if (pdfFrame) pdfFrame.src = '';
    if (modelViewer) modelViewer.src = '';
    overlay.classList.remove('visible');
  };

  // -------- Core tab UI setup --------
  function mountMedia(item, media){
    viewer.innerHTML = '';
    strip.innerHTML = '';
    if (!media || !media.length) return;

    const open = (idx)=>{
      const mm = media[idx];
      viewer.innerHTML = '';
      viewer.appendChild(mm.type === 'video'
        ? Object.assign(document.createElement('video'), { src:mm.src, controls:true, playsinline:true })
        : Object.assign(document.createElement('img'), { src:mm.src, alt:item.title || '' })
      );
      [...strip.children].forEach((im,i)=>im.classList.toggle('active', i===idx));
    };

    media.forEach((mm,i)=>{
      const thumb = mm.type==='image'? mm.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const im = Object.assign(document.createElement('img'), { src:thumb, alt:'thumb' });
      if(i===0) im.classList.add('active');
      im.onclick = ()=> open(i);
      strip.appendChild(im);
    });
    open(0);
  }

  function clearPanels(){ panelHost.innerHTML=''; tabsBar.innerHTML=''; }

  function addTab(label, renderFn){
    const id = 'tab-'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const btn = Object.assign(document.createElement('button'), { className:'tab', textContent:label });
    const panel = Object.assign(document.createElement('div'), { className:'panel', id });
    tabsBar.appendChild(btn); panelHost.appendChild(panel);
    btn.onclick = ()=>{
      [...tabsBar.children].forEach(b=>b.classList.remove('active'));
      [...panelHost.children].forEach(p=>p.classList.remove('active'));
      btn.classList.add('active'); panel.classList.add('active');
      renderFn(panel);
    };
    return {btn, panel};
  }

  // -------- Main logic --------
  (async function(){
    let list = [];
    try { list = await getJSON('/assets/work.json'); }
    catch(e){ console.error('work.json error', e); return; }
    if (!Array.isArray(list)) return;

    const items = list.map((raw,i)=>{
      const gallery = Array.isArray(raw.gallery)? raw.gallery.map(fix) : [];
      const media = Array.isArray(raw.media)&&raw.media.length
        ? raw.media.map(m=> m&&m.type ? ({...m,src:fix(m.src)}) : ({type:'image',src:fix(m)}))
        : gallery.map(src=>({type:'image',src}));
      return {
        id: raw.id || raw.slug || `item-${i+1}`,
        slug: (raw.slug||raw.id||'').trim(),
        title: raw.title || '',
        client: raw.client || '',
        role: raw.role || '',
        year: raw.year || '',
        description: raw.description || '',
        media,
        tabs: Array.isArray(raw.tabs)? raw.tabs : null
      };
    });

    const item = items.find(x=> x.slug===slug) || items[0];
    if (!item) return;

    t.textContent = item.title || 'Project';
    m.textContent = [item.role, item.client, item.year].filter(Boolean).join(' • ');
    d.textContent = item.description || '';

    clearPanels();

    if (item.tabs && item.tabs.length){
      item.tabs.forEach(tab=>{
        const type = (tab.type || 'media').toLowerCase();

        if (type === 'media'){
          const media = (tab.media && tab.media.length) ? tab.media.map(x=>({type:'image',src:fix(x)})) : item.media;
          const {btn,panel} = addTab(tab.label || 'Renderings', ()=> {
            viewer.style.display=''; strip.style.display='';
            panel.innerHTML=''; mountMedia(item, media);
          });
          if (!tabsBar.querySelector('.tab.active')) btn.click();
        }

        if (type === 'files'){
          const files = Array.isArray(tab.files) ? tab.files : [];
          addTab(tab.label || 'Files', (panel)=>{
            viewer.style.display='none'; strip.style.display='none';
            panel.innerHTML='';
            const list = document.createElement('div'); list.className='files-list';
            files.forEach(f=>{
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'file-link';
              btn.textContent = f.label || 'View File';
              btn.onclick = e=>{
                e.stopPropagation();
                openAssetOverlay(fix(f.href || ''));
              };
              list.appendChild(btn);
            });
            panel.appendChild(list);
          });
        }
      });
    } else {
      viewer.style.display=''; strip.style.display='';
      mountMedia(item, item.media);
    }
  })();
})();