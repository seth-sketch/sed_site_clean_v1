/* Robust grid renderer for both home and work pages.
   It supports two container ids: #homeGrid OR #grid (and #workGrid).
   It also tolerates different work.json paths and uses cache-busting.
   Project linking rules:
     - If item.href is present, uses that.
     - Else if item.slug present, uses project.html?slug=...
     - Else renders a non-clicking card.
*/
(function(){
  async function loadFirstJSON(urls){
    for (const url of urls){
      try{
        const r = await fetch(url, { cache: "no-store" });
        if (r.ok) return await r.json();
      }catch(e){ /* keep trying */ }
    }
    return [];
  }

  function esc(s){ return String(s||""); }

  function card(p){
    const title = esc(p.title);
    const meta  = [p.client, p.year, p.role].filter(Boolean).map(esc).join(" · ");
    const img   = esc(p.cover || (p.gallery && p.gallery[0]) || "");
    let href    = "#";
    if (p.href) {
      href = esc(p.href);
    } else if (p.slug) {
      href = "project.html?slug=" + encodeURIComponent(p.slug);
    } else if (p.page) {
      href = esc(p.page);
    }

    const cover = img ? `<span class="ratio-169"><img src="${img}" alt=""></span>`
                      : `<span class="ratio-169" style="background:#eef2ff"></span>`;

    return `
<article class="card">
  <a class="cover" href="${href}">
    ${cover}
  </a>
  <div class="footer">
    <a href="${href}">${title}</a>
    <div class="meta">${meta}</div>
  </div>
</article>`;
  }

  function renderInto(id, items){
    const el = document.getElementById(id);
    if (!el) return;
    if (!Array.isArray(items) || !items.length){
      console.warn("work.json empty or missing");
      el.innerHTML = "";
      return;
    }
    el.innerHTML = items.map(card).join("");
  }

  const paths = [
    "assets/work.json?v="+Date.now(),
    "./assets/work.json?v="+Date.now(),
    "/assets/work.json?v="+Date.now(),
    "work.json?v="+Date.now()
  ];
  loadFirstJSON(paths).then((data)=>{
    // Render to any containers present
    ["homeGrid","grid","workGrid"].forEach(id => renderInto(id, data));
  });
})();