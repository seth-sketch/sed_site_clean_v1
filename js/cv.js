(async () => {
  const root = document.getElementById("cv-root");
  try {
    const res = await fetch("/assets/data/cv.json");
    const cv = await res.json();
    root.innerHTML = `
      <h1>${cv.name}</h1>
      <p class="meta">${cv.headline || ""}</p>
      <p>${cv.summary || ""}</p>
      <h2>Experience</h2>
      ${(cv.experience || []).map(x => `
        <article class="cv-item">
          <h3>${x.title}</h3>
          <p><strong>${x.organization || ""}</strong> · ${x.location || ""}</p>
          <p>${x.date_range || ""}</p>
          <ul>${(x.highlights || []).map(h => `<li>${h}</li>`).join("")}</ul>
        </article>
      `).join("")}
    `;
  } catch (e) {
    root.innerHTML = "<p>Couldn't load CV JSON.</p>";
    console.error(e);
  }
})();