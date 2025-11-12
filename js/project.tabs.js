// Improved Project Tabs script
// Handles slug matching more flexibly and shows renderings/drafting tabs
// Compatible with the updated work.json (with tabs entries)
(function(){
  'use strict';
  // prevent double-initialisation
  if (window.__PROJ_TABS__) return;
  window.__PROJ_TABS__ = true;
  // helpers
  const $  = (sel, scope=document) => scope.querySelector(sel);
  const $$ = (sel, scope=document) => Array.from(scope.querySelectorAll(sel));
  const qs = new URLSearchParams(location.search);
  const rawSlug = qs.get('slug') || '';
  // normalise slug: decode, lower-case, strip leading/trailing spaces, remove extra slashes
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();
  function fixPath(p){
    if(!p) return p;
    return (/^https?:\/\//i.test(p) || p.startsWith('/')) ? p : '/' + p.replace(/^\/+/, '');
  }
  async function getJSON(url){
    const res = await fetch(url + (url.includes('?')?'&':'?') + 'v=' + Date.now(), {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP ' + res.status + ' for ' + url);
    return res.json();
  }
  // overlay logic
  function openAssetOverlay(href){
    const overlay = $('#assetOverlay');
    const pdfFrame = $('#pdfFrame');
    const modelViewer = $('#modelViewer');
    const msg = $('#assetMessage');
    if(!overlay) return;
    overlay.classList.add('visible');
    if(pdfFrame){ pdfFrame.hidden = true; pdfFrame.src = ''; }
    if(modelViewer){ modelViewer.hidden = true; modelViewer.src = ''; }
    if(msg){ msg.hidden = true; msg.textContent = ''; }
    if(href && /\.pdf$/i.test(href)){
      if(pdfFrame){ pdfFrame.src = fixPath(href) + (href.includes('#') ? '' : '#view=FitH'); pdfFrame.hidden = false; }
      return;
    }
    if(href && /\.(glb|gltf|obj|usdz)$/i.test(href)){
      if(modelViewer){ modelViewer.src = fixPath(href); modelViewer.hidden = false; }
      return;
    }
    if(msg){ msg.textContent = 'Unsupported file type'; msg.hidden = false; }
  }
  // overlay close
  const closeBtn = $('#assetCloseBtn');
  if(closeBtn) closeBtn.addEventListener('click', ()=>{
    const overlay = $('#assetOverlay');
    const pdfFrame = $('#pdfFrame');
    const modelViewer = $('#modelViewer');
    if(pdfFrame) pdfFrame.src = '';
    if(modelViewer) modelViewer.src = '';
    if(overlay) overlay.classList.remove('visible');
  });
  const overlayRoot = $('#assetOverlay');
  if(overlayRoot){ overlayRoot.addEventListener('click',(e)=>{ if(e.target === overlayRoot) closeBtn?.click(); }); }
  document.addEventListener('keydown',(e)=>{ if(e.key === 'Escape') closeBtn?.click(); });
  // mount points
  const shell = $('#project-shell');
  const titleEl = $('#projTitle');
  const metaEl  = $('#projMeta');
  const descEl  = $('#projDesc');
  const viewer  = $('#projViewer');
  const strip   = $('#projStrip');
  // create tabs and panel container
  const tabsBar = document.createElement('nav'); tabsBar.id = 'projTabs';
  const panelHost = document.createElement('section'); panelHost.id = 'projPanel';
  if(shell && viewer && descEl){ shell.insertBefore(tabsBar, viewer); shell.insertBefore(panelHost, descEl); }
  // media renderer
  function mountMedia(item, media){
    if(!viewer || !strip) return;
    viewer.innerHTML = '';
    strip.innerHTML  = '';
    if(!Array.isArray(media) || !media.length) return;
    function openAt(i){
      const m = media[i];
      viewer.innerHTML = '';
      if(m?.type === 'video'){
        const v = document.createElement('video'); v.src = m.src; v.controls = true; v.playsInline = true; viewer.appendChild(v);
      }else{
        const img = document.createElement('img'); img.src = m.src; img.alt = item.title || ''; viewer.appendChild(img);
      }
      Array.from(strip.children).forEach((im, idx)=> im.classList.toggle('active', idx === i));
    }
    media.forEach((mm,i)=>{
      const thumb = (mm?.type === 'image') ? mm.src : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const im = document.createElement('img'); im.src = thumb; im.alt = 'thumb'; if(i===0) im.classList.add('active'); im.addEventListener('click', ()=> openAt(i)); strip.appendChild(im);
    });
    openAt(0);
  }
  // tab helpers
  function clearPanels(){ panelHost.innerHTML = ''; tabsBar.innerHTML = ''; }
  function addTab(label, render){
    const id = 'tab-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const btn = document.createElement('button'); btn.className = 'tab'; btn.textContent = label;
    const panel = document.createElement('div'); panel.className = 'panel'; panel.id = id;
    tabsBar.appendChild(btn); panelHost.appendChild(panel);
    btn.addEventListener('click', ()=>{
      $$('.tab', tabsBar).forEach(b=> b.classList.remove('active'));
      $$('.panel', panelHost).forEach(p=> p.classList.remove('active'));
      btn.classList.add('active'); panel.classList.add('active');
      render(panel);
    });
    return {btn, panel};
  }
  // main init
  (async function init(){
    try{
      const data = await getJSON('/assets/work.json');
      if(!Array.isArray(data)) return;
      // normalise items
      const items = data.map((raw,i)=>{
        const gallery = Array.isArray(raw.gallery) ? raw.gallery.map(fixPath) : [];
        const media = Array.isArray(raw.media) && raw.media.length ? raw.media.map(m => (m && m.type) ? ({...m, src: fixPath(m.src)}) : ({type:'image', src: fixPath(m)})) : gallery.map(src => ({type:'image', src}));
        return {
          id: raw.id || raw.slug || `item-${i+1}`,
          slug: (raw.slug || raw.id || '').toLowerCase().trim(),
          title: raw.title || '',
          client: raw.client || '',
          role: raw.role || '',
          year: raw.year || '',
          description: raw.description || '',
          media,
          tabs: Array.isArray(raw.tabs) ? raw.tabs : null,
          draftings: Array.isArray(raw.draftings) ? raw.draftings : []
        };
      });
      // try direct match (case-insensitive)
      let item = items.find(x => x.slug === slug);
      // fallback: match ignoring hyphens and underscores
      if(!item && slug){
        const slugSimple = slug.replace(/[-_]/g,'');
        item = items.find(x => x.slug.replace(/[-_]/g,'') === slugSimple);
      }
      if(!item) item = items[0];
      if(!item) return;
      // populate meta
      if(titleEl) titleEl.textContent = item.title || 'Project';
      if(metaEl) metaEl.textContent = [item.role, item.client, item.year].filter(Boolean).join(' • ');
      if(descEl) descEl.textContent = item.description || '';
      clearPanels();
      // build from tabs if present
      if(item.tabs && item.tabs.length){
        item.tabs.forEach(tab => {
          const type = (tab.type || 'media').toLowerCase();
          if(type === 'media'){
            const imgs = (tab.media && tab.media.length) ? tab.media.map(x => ({type:'image', src: fixPath(x)})) : item.media;
            const {btn} = addTab(tab.label || 'Renderings', () => {
              if(viewer) viewer.style.display = '';
              if(strip) strip.style.display = '';
              mountMedia(item, imgs);
            });
            if(!$('.tab.active', tabsBar)) btn.click();
          }
          if(type === 'files'){
            const files = Array.isArray(tab.files) ? tab.files : [];
            addTab(tab.label || 'Files', (panel) => {
              if(viewer) viewer.style.display = 'none';
              if(strip) strip.style.display = 'none';
              panel.innerHTML = '';
              const list = document.createElement('div'); list.className = 'files-list';
              files.forEach(f => {
                const b = document.createElement('button');
                b.type = 'button'; b.className = 'file-link'; b.textContent = f.label || 'View File';
                b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openAssetOverlay(fixPath(f.href || '')); });
                list.appendChild(b);
              });
              panel.appendChild(list);
            });
          }
        });
        // extra tab for legacy draftings
        if(item.draftings && item.draftings.length){
          addTab('Draftings', (panel) => {
            if(viewer) viewer.style.display = 'none';
            if(strip) strip.style.display = 'none';
            panel.innerHTML = '';
            const list = document.createElement('div'); list.className = 'files-list';
            item.draftings.forEach((href,i) => {
              const b = document.createElement('button'); b.type = 'button'; b.className = 'file-link'; b.textContent = `View PDF ${i+1}`;
              b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openAssetOverlay(fixPath(href)); });
              list.appendChild(b);
            });
            panel.appendChild(list);
          });
        }
        if(!$('.tab.active', tabsBar)){
          const first = $('.tab', tabsBar);
          first && first.click();
        }
        return;
      }
      // fallback: just render media + optional draftings
      if(viewer) viewer.style.display = '';
      if(strip) strip.style.display = '';
      mountMedia(item, item.media);
      if(item.draftings && item.draftings.length){
        addTab('Draftings', (panel) => {
          if(viewer) viewer.style.display = 'none';
          if(strip) strip.style.display = 'none';
          panel.innerHTML = '';
          const list = document.createElement('div'); list.className = 'files-list';
          item.draftings.forEach((href,i) => {
            const b = document.createElement('button'); b.type = 'button'; b.className = 'file-link'; b.textContent = `View PDF ${i+1}`;
            b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openAssetOverlay(fixPath(href)); });
            list.appendChild(b);
          });
          panel.appendChild(list);
        });
        addTab('Renderings', () => { if(viewer) viewer.style.display = ''; if(strip) strip.style.display = ''; mountMedia(item, item.media); });
        const first = $('.tab', tabsBar);
        first && first.click();
      }
    }catch(err){
      console.error(err);
    }
  })();
})();