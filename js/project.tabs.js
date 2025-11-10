(function(){
  'use strict';
  if (window.__PROJ_TABS__) return;
  window.__PROJ_TABS__ = true;

  // ---------- helpers ----------
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const qp = new URLSearchParams(location.search);
  const slug = (qp.get('slug') || '').trim();

  const fix = (p) => (!p ? p : (/^https?:\/\//i.test(p) || p.startsWith('/') ? p : '/' + p.replace(/^\/+/, '')));

  async function getJSON(u){
    const r = await fetch(u + (u.includes('?')?'&':'?') + 'v=' + Date.now(), {cache:'no-store'});
    if(!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  // ---------- overlay ----------
  function openAssetOverlay(href) {
    const overlay = $('#assetOverlay');
    const pdfFrame = $('#pdfFrame');
    const modelViewer = $('#modelViewer');
    const msg = $('#assetMessage');
    if (!overlay) return;

    overlay.classList.add('visible');
    if (pdfFrame) { pdfFrame.hidden = true; pdfFrame.src = ''; }
    if (modelViewer) { modelViewer.hidden = true; modelViewer.src = ''; }
    if (msg) { msg.hidden = true; msg.textContent = ''; }

    if (href && /\.pdf$/i.test(href)) {
      if (pdfFrame) { pdfFrame.src = fix(href) + (href.includes('#') ? '' : '#view=FitH'); pdfFrame.hidden = false; }
      return;
    }
    if (href && /\.(glb|gltf|obj|usdz)$/i.test(href)) {
      if (modelViewer) { modelViewer.src = fix(href); modelViewer.hidden = false; }
      return;
    }
    if (msg) { msg.textContent = 'Unsupported file type'; msg.hidden = false; }
  }

  const closeBtn = $('#assetCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const overlay = $('#assetOverlay');
      const pdfFrame = $('#pdfFrame');
      const modelViewer = $('#modelViewer');
      if (pdfFrame) pdfFrame.src = '';
      if (modelViewer) modelViewer.src = '';
      if (overlay) overlay.classList.remove('visible');
    });
  }
  // click outside to close
  const overlayRoot = $('#assetOverlay');
  if (overlayRoot) {
    overlayRoot.addEventListener('click', (e)=>{
      if (e.target === overlayRoot) {
        closeBtn?.click();
      }
    });
  }
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeBtn?.click(); });

  // ---------- mount points ----------
  const shell = $('#project-shell');
  const titleEl = $('#projTitle');
  const metaEl  = $('#projMeta');
  const descEl  = $('#projDesc');
  const viewer  = $('#projViewer');
  const strip   = $('#projStrip');

  // inject tabs UI containers
  const tabsBar = document.createElement('nav'); tabsBar.id = 'projTabs';
  const panelHost = document.createElement('section'); panelHost.id = 'projPanel';
  if (shell && viewer && descEl) {
    shell.insertBefore(tabsBar, viewer);
    shell.insertBefore(panelHost, descEl);
  }

  // ---------- media renderer ----------
  function mountMedia(item, media){
    if (!viewer || !strip) return;
    viewer.innerHTML = '';
    strip.innerHTML  = '';
    if (!Array.isArray(media) || !media.length) return;

    const open = (i) => {
      const mm = media[i];
      viewer.innerHTML = '';
      if (mm?.type === 'video') {
        const v = document.createElement('video');
        v.src = mm.src; v.controls = true; v.playsInline = true;
        viewer.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = mm.src; img.alt = item.title || '';
        viewer.appendChild(img);
      }
      // thumb active
      Array.from(strip.children).forEach((im, idx)=>im.classList.toggle('active', idx === i));
    };

    media.forEach((mm, i)=>{
      const thumb = (mm?.type === 'image') ? mm.src :
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="%23000"/><polygon points="45,25 45,55 75,40" fill="%23fff"/></svg>';
      const im = Object.assign(document.createElement('img'), {src: thumb, alt:'thumb'});
      if (i === 0) im.classList.add('active');
      im.addEventListener('click', ()=>open(i));
      strip.appendChild(im);
    });
    open(0);
  }

  // ---------- tabs ----------
  function clearPanels(){ panelHost.innerHTML = ''; tabsBar.innerHTML = ''; }

  function addTab(label, render){
    const id = 'tab-' + label.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    const btn = document.createElement('button'); btn.className = 'tab'; btn.textContent = label;
    const panel = document.createElement('div'); panel.className = 'panel'; panel.id = id;

    tabsBar.appendChild(btn); panelHost.appendChild(panel);

    btn.addEventListener('click', ()=>{
      $$('.tab', tabsBar).forEach(b=>b.classList.remove('active'));
      $$('.panel', panelHost).forEach(p=>p.classList.remove('active'));
      btn.classList.add('active'); panel.classList.add('active');
      render(panel);
    });
    return {btn, panel};
  }

  // ---------- main ----------
  (async function init(){
    try {
      const data = await getJSON('/assets/work.json');
      if (!Array.isArray(data)) return;

      // normalize items for safe rendering
      const items = data.map((raw, i)=>{
        const gallery = Array.isArray(raw.gallery) ? raw.gallery.map(fix) : [];
        const media   = Array.isArray(raw.media) && raw.media.length
          ? raw.media.map(m => (m && m.type) ? ({...m, src: fix(m.src)}) : ({type:'image', src: fix(m)}))
          : gallery.map(src => ({type:'image', src}));

        return {
          id:   raw.id || raw.slug || `item-${i+1}`,
          slug: (raw.slug || raw.id || '').trim(),
          title: raw.title || '',
          client: raw.client || '',
          role: raw.role || '',
          year: raw.year || '',
          description: raw.description || '',
          media,
          // support both new "tabs" and legacy "draftings"
          tabs: Array.isArray(raw.tabs) ? raw.tabs : null,
          draftings: Array.isArray(raw.draftings) ? raw.draftings : []
        };
      });

      const item = items.find(x => x.slug === slug) || items[0];
      if (!item) return;

      if (titleEl) titleEl.textContent = item.title || 'Project';
      if (metaEl)  metaEl.textContent  = [item.role, item.client, item.year].filter(Boolean).join(' • ');
      if (descEl)  descEl.textContent  = item.description || '';

      clearPanels();

      // Build from tabs if present
      if (item.tabs && item.tabs.length) {
        item.tabs.forEach(tab=>{
          const type = (tab.type || 'media').toLowerCase();

          if (type === 'media') {
            const imgs = (tab.media && tab.media.length) ? tab.media.map(x => ({type:'image', src: fix(x)})) : item.media;
            const {btn, panel} = addTab(tab.label || 'Renderings', ()=>{
              if (viewer) viewer.style.display = '';
              if (strip)  strip.style.display  = '';
              panel.innerHTML=''; // panel unused for media; we mount into viewer/strip
              mountMedia(item, imgs);
            });
            if (!$('.tab.active', tabsBar)) btn.click();
          }

          if (type === 'files') {
            const files = Array.isArray(tab.files) ? tab.files : [];
            addTab(tab.label || 'Files', (panel)=>{
              if (viewer) viewer.style.display = 'none';
              if (strip)  strip.style.display  = 'none';
              panel.innerHTML = '';
              const list = document.createElement('div'); list.className = 'files-list';
              files.forEach(f=>{
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'file-link';
                btn.textContent = f.label || 'View File';
                btn.addEventListener('click', (e)=>{
                  e.preventDefault(); e.stopPropagation();
                  openAssetOverlay(fix(f.href || ''));
                });
                list.appendChild(btn);
              });
              panel.appendChild(list);
            });
          }
        });

        // legacy “draftings” also shown as extra tab if present
        if (item.draftings && item.draftings.length) {
          addTab('Draftings', (panel)=>{
            if (viewer) viewer.style.display = 'none';
            if (strip)  strip.style.display  = 'none';
            panel.innerHTML = '';
            const list = document.createElement('div'); list.className = 'files-list';
            item.draftings.forEach((href, i)=>{
              const btn = document.createElement('button');
              btn.type = 'button';
              btn.className = 'file-link';
              btn.textContent = `View PDF ${i+1}`;
              btn.addEventListener('click', (e)=>{
                e.preventDefault(); e.stopPropagation();
                openAssetOverlay(fix(href));
              });
              list.appendChild(btn);
            });
            panel.appendChild(list);
          });
        }

        if (!$('.tab.active', tabsBar)) {
          // if no tab was auto-selected, default to media
          const first = $('.tab', tabsBar);
          first && first.click();
        }
        return;
      }

      // No tabs — legacy single-page behavior with optional draftings list
      if (viewer) viewer.style.display = '';
      if (strip)  strip.style.display  = '';
      mountMedia(item, item.media);

      if (item.draftings && item.draftings.length) {
        const {btn, panel} = addTab('Draftings', (panel)=>{
          if (viewer) viewer.style.display = 'none';
          if (strip)  strip.style.display  = 'none';
          panel.innerHTML = '';
          const list = document.createElement('div'); list.className = 'files-list';
          item.draftings.forEach((href, i)=>{
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'file-link';
            b.textContent = `View PDF ${i+1}`;
            b.addEventListener('click', (e)=>{
              e.preventDefault(); e.stopPropagation();
              openAssetOverlay(fix(href));
            });
            list.appendChild(b);
          });
          panel.appendChild(list);
        });
        // renderings tab too for parity
        addTab('Renderings', ()=>{ if (viewer) viewer.style.display=''; if (strip) strip.style.display=''; mountMedia(item, item.media); });
        // default to Renderings
        const first = $('.tab', tabsBar);
        first && first.click();
      }

    } catch(err){
      console.error('[SED] Project init failed:', err);
    }
  })();
})();