(async () => {
  const root = document.getElementById("cv-root");
  if (!root) return;

  try {
    const res = await fetch("/data/cv.json"); // <-- matches your folder
    const cv = await res.json();

    const expHtml = (cv.experience || [])
      .map(
        (exp) => `
        <article class="cv-item">
          <h3>${exp.title}</h3>
          <p><strong>${exp.organization || ""}</strong> · ${exp.location || ""}</p>
          <p class="dates">${exp.date_range || ""}</p>
          <ul>
            ${(exp.highlights || []).map((h) => `<li>${h}</li>`).join("")}
          </ul>
        </article>
      `
      )
      .join("");

    const creditsHtml = (cv.credits || [])
      .map(
        (c) =>
          `<li><strong>${c.title}</strong>${c.year ? " (" + c.year + ")" : ""} — ${
            c.role || ""
          }</li>`
      )
      .join("");

    root.innerHTML = `
      <h1>${cv.name || "CV"}</h1>
      ${cv.headline ? `<p class="meta">${cv.headline}</p>` : ""}
      ${cv.summary ? `<p>${cv.summary}</p>` : ""}

      <h2>Experience</h2>
      ${expHtml || "<p>No experience added yet.</p>"}

      <h2>Selected Production Designer Credits</h2>
      <ul class="cv-list">
        ${creditsHtml || "<li>Add credits to data/cv.json</li>"}
      </ul>

      <h2>Skills</h2>
      <p>${(cv.skills || []).join(" · ")}</p>
    `;
  } catch (err) {
    console.error(err);
    root.innerHTML = "<p>Couldn't load CV JSON.</p>";
  }
})();