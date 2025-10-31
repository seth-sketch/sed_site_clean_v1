(async function () {
  const root = document.getElementById("cv-root");
  try {
    const res = await fetch("/assets/data/cv.json");
    const cv = await res.json();

    // basic render
    root.innerHTML = `
      <h1>${cv.name}</h1>
      <p class="meta">${cv.headline || ""}</p>
      <p>${cv.summary || ""}</p>

      <h2>Experience</h2>
      <div class="cv-block">
        ${(cv.experience || [])
          .map(exp => {
            return `
              <article class="cv-item">
                <h3>${exp.title}</h3>
                <p><strong>${exp.organization || ""}</strong> · ${exp.location || ""}</p>
                <p class="dates">${exp.date_range || ""}</p>
                <ul>
                  ${(exp.highlights || [])
                    .map(h => `<li>${h}</li>`)
                    .join("")}
                </ul>
              </article>
            `;
          })
          .join("")}
      </div>

      <h2>Selected Production Designer Credits (IMDb)</h2>
      <ul class="cv-list">
        ${(cv.credits || [])
          .map(c => `<li><strong>${c.title}</strong> (${c.year || ""}) — ${c.role}${c.type ? " · " + c.type : ""}</li>`)
          .join("")}
      </ul>

      <h2>Skills</h2>
      <p>${(cv.skills || []).join(" · ")}</p>

      <p style="margin-top:2rem;font-size:.8rem;">Source: ${cv.imdb_url || ""}</p>
    `;
  } catch (err) {
    root.innerHTML = "<p>Could not load CV.</p>";
    console.error(err);
  }
})();