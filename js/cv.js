(async () => {
  const root = document.getElementById("cv-root");
  if (!root) return;

  try {
    // YOUR JSON IS HERE 👇
    const res = await fetch("/assets/cv.json");
    const cv = await res.json();

    const exp = (cv.experience || [])
      .map(exp => `
        <article class="cv-item">
          <h3>${exp.title}</h3>
          <p><strong>${exp.organization || ""}</strong>${exp.location ? " · " + exp.location : ""}</p>
          <p class="dates">${exp.date_range || ""}</p>
          <ul>
            ${(exp.highlights || []).map(h => `<li>${h}</li>`).join("")}
          </ul>
        </article>
      `)
      .join("");

    const credits = (cv.imdb_production_designer_credits || cv.credits || [])
      .map(c => `
        <li>
          <strong>${c.title}</strong>${c.year ? " (" + c.year + ")" : ""} — ${c.role || "Production Designer"}
          ${c.type ? " · " + c.type : ""}
        </li>
      `)
      .join("");

    root.innerHTML = `
      <h1>${cv.name || "Seth Easter"}</h1>
      ${cv.headline ? `<p class="meta">${cv.headline}</p>` : ""}
      ${cv.summary ? `<p>${cv.summary}</p>` : ""}

      <h2>Experience</h2>
      ${exp || "<p>No experience in JSON.</p>"}

      <h2>Selected Production Designer Credits</h2>
      <ul class="cv-list">
        ${credits || "<li>Add credits to assets/cv.json</li>"}
      </ul>

      ${cv.skills ? `<h2>Skills</h2><p>${cv.skills.join(" · ")}</p>` : ""}
    `;
  } catch (err) {
    console.error(err);
    root.innerHTML = "<p>Couldn't load CV JSON from /assets/cv.json.</p>";
  }
})();