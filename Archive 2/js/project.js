(function() {
  'use strict';

  // Helper functions
  const $ = (sel, scope) => (scope || document).querySelector(sel);
  const $$ = (sel, scope) => Array.from((scope || document).querySelectorAll(sel));

  async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load ' + url);
    return await res.json();
  }

  // --- PDF Overlay ---
  function openPDF(url) {
    const overlay = $('#pdfOverlay');
    const frame = $('#pdfFrame');
    frame.src = url;
    overlay.classList.add('visible');
  }

  function closePDF() {
    const overlay = $('#pdfOverlay');
    const frame = $('#pdfFrame');
    frame.src = '';
    overlay.classList.remove('visible');
  }

  window.openPDF = openPDF;
  window.closePDF = closePDF;

  // --- Project Navigation ---
  async function initProject() {
    const titleEl = $('[data-project="title"]');
    const metaEl = $('[data-project="meta"]');
    const heroEl = $('#projectHero');
    const thumbsEl = $('#projectThumbs');

    const slug = new URLSearchParams(window.location.search).get('slug');
    if (!slug) return;

    const projects = await loadJSON('/assets/work.json');
    const projectIndex = projects.findIndex(p => p.slug === slug);
    if (projectIndex === -1) return;

    const project = projects[projectIndex];
    titleEl.textContent = project.title;
    metaEl.innerHTML = project.meta || '';
    heroEl.innerHTML = project.hero ? `<img src="${project.hero}" alt="${project.title}">` : '';
    thumbsEl.innerHTML = (project.thumbs || [])
      .map(t => `<img src="${t}" alt="${project.title} thumbnail">`)
      .join('');

    // Next / Prev links
    const prev = projects[projectIndex - 1] || null;
    const next = projects[projectIndex + 1] || null;

    const backBtn = $('[data-project="back"]');
    const nextBtn = $('[data-project="next"]');
    const homeBtn = $('[data-project="home"]');

    if (backBtn) backBtn.href = prev ? `/project/?slug=${prev.slug}` : '/work/';
    if (nextBtn) {
      if (next) {
        nextBtn.href = `/project/?slug=${next.slug}`;
        nextBtn.classList.remove('disabled');
      } else {
        nextBtn.href = '/work/';
        nextBtn.classList.add('disabled');
      }
    }

    if (homeBtn) homeBtn.addEventListener('click', e => {
      e.preventDefault();
      window.location.href = '/';
    });
  }

  document.addEventListener('DOMContentLoaded', initProject);
})();
