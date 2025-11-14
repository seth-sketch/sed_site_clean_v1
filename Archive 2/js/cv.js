(async () => {
  const root = document.getElementById("cv-root");
  if (!root) return;

  const esc = (s) => String(s || "").replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  const list = (arr) => `<ul class="cv-list">${(arr||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;

  const renderExperience = (items) => {
    if (!items || !items.length) return "<p>No experience yet.</p>";
    return `<div class="cv-grid">${items.map(exp => `
      <article class="cv-item">
        <h3>${esc(exp.title)}</h3>
        <p><strong>${esc(exp.organization||"")}</strong>${exp.location?` · ${esc(exp.location)}`:""}</p>
        <p class="cv-meta">${esc(exp.date_range||"")}</p>
        ${list(exp.highlights||[])}
      </article>`).join("")}</div>`;
  };

  const renderCredits = (label, items) => {
    if (!items || !items.length) return "";
    const rows = items
      .sort((a,b)=> (b.year||0)-(a.year||0) || String(a.title).localeCompare(String(b.title)))
      .map(c => `<li><strong>${esc(c.title)}</strong>${c.year?` (${esc(c.year)})`:""} — ${esc(c.role||"")}${c.type?` · ${esc(c.type)}`:""}${c.network?` · ${esc(c.network)}`:""}${c.notes?` — ${esc(c.notes)}`:""}</li>`)
      .join("");
    return `<h2>${esc(label)}</h2><ul class="cv-list">${rows}</ul>`;
  };

  try {
    const res = await fetch("/assets/cv.json");
    const cv = await res.json();

    const skills = (cv.skills||[]).join(" · ");
    const edu = (cv.education||[]).map(e=>`${esc(e.institution)} — ${esc(e.program||"")}${e.location?` · ${esc(e.location)}`:""}`).join("<br/>");
    const mem = (cv.memberships||[]).join(" · ");
    const awards = (cv.awards||[]).map(a=>`<li><strong>${esc(a.name)}</strong> — ${esc(a.year||"")}${a.organization?` · ${esc(a.organization)}`:""}${a.work?` · ${esc(a.work)}`:""}${a.role?` · ${esc(a.role)}`:""}</li>`).join("");

    root.innerHTML = `
      <h1>${esc(cv.name || "CV")}</h1>
      ${cv.headline ? `<p class="cv-meta">${esc(cv.headline)}</p>` : ""}
      ${cv.summary ? `<p>${esc(cv.summary)}</p>` : ""}

      <h2>Experience</h2>
      ${renderExperience(cv.experience)}

      ${renderCredits("Production Designer Credits (IMDb)", cv.imdb_production_designer_credits || cv.credits)}

      ${cv.art_direction_credits && cv.art_direction_credits.length ? `
        <h2>Art Direction & Earlier Credits</h2>
        <ul class="cv-list">
          ${cv.art_direction_credits.map(c=>`<li><strong>${esc(c.title)}</strong>${c.year?` (${esc(c.year)})`:""}${c.years?` (${esc(c.years.join(", "))})`:""} — ${esc(c.role||"")}${c.company?` · ${esc(c.company)}`:""}${c.network?` · ${esc(c.network)}`:""}</li>`).join("")}
        </ul>` : ""}

      <div class="cv-two">
        <div>
          <h2>Education</h2>
          <p>${edu || "—"}</p>
          ${mem ? `<h2 style="margin-top:1rem;">Memberships</h2><p>${esc(mem)}</p>` : ""}
        </div>
        <div>
          <h2>Awards</h2>
          <ul class="cv-list">${awards || "<li>—</li>"}</ul>
        </div>
      </div>

      ${skills ? `<h2>Skills</h2><p>${esc(skills)}</p>` : ""}

      <p class="mono" style="margin-top:2rem;">Source: ${cv.imdb_url ? `<a href="${esc(cv.imdb_url)}" target="_blank" rel="noopener">IMDb</a>` : "—"} · v${esc(cv.cv_version)} · Updated ${esc(cv.last_updated)}</p>
    `;
  } catch (err) {
    console.error(err);
    root.innerHTML = "<p>Couldn't load CV JSON from /assets/cv.json.</p>";
  }
})();
