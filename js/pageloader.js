// js/pageLoader.js

(function () {
  const map = window.FREYJA_CONTENT_MAP;
  if (!map || !Array.isArray(map.chapters)) return;

  const leftInner  = document.querySelector('#codex-page-left .codex-page-inner');
  const rightInner = document.querySelector('#codex-page-right .codex-page-inner');

  if (!leftInner || !rightInner) return;

  // Flatten all pages into a linear array of page descriptors
  const flatPages = [];

  map.chapters.forEach((chapter, chapterIndex) => {
    const pageNumbers = Object.keys(chapter.pages || {})
      .map(n => parseInt(n, 10))
      .sort((a, b) => a - b);

    pageNumbers.forEach(pageNum => {
      flatPages.push({
        chapterIndex,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        logicalPage: pageNum,
        data: chapter.pages[pageNum]
      });
    });
  });

  function renderPage(targetEl, page) {
    if (!page) {
      targetEl.innerHTML = ""; // or placeholder vellum
      targetEl.classList.add("codex-page-empty");
      return;
    }

    const d = page.data || {};
    const rubric = d.headingRubric ? `<div class="rubric">${d.headingRubric}</div>` : "";
    const heading = d.headingMain ? `<h2>${d.headingMain}</h2>` : "";
    const sigil = d.sigil ? `<div class="codex-sigil ${d.sigil}"></div>` : "";
    const dropcap = d.dropcap || "";
    const body = Array.isArray(d.body) ? d.body : [];

    const bodyHtml = body
      .map((para, index) => {
        if (index === 0 && dropcap) {
          return `<p class="dropcap">${para}</p>`;
        }
        return `<p>${para}</p>`;
      })
      .join("");

    targetEl.classList.remove("codex-page-empty");
    targetEl.innerHTML = `
      ${sigil}
      ${rubric}
      ${heading}
      ${bodyHtml}
    `;
  }

  // Load a spread (two pages) by spread index (0-based)
  function loadSpread(spreadIndex) {
    const leftPageIndex = spreadIndex * 2;
    const rightPageIndex = spreadIndex * 2 + 1;

    const leftPage  = flatPages[leftPageIndex]  || null;
    const rightPage = flatPages[rightPageIndex] || null;

    renderPage(leftInner, leftPage);
    renderPage(rightInner, rightPage);

    if (window.CodexNavigation && typeof window.CodexNavigation.updateIndicator === "function") {
      window.CodexNavigation.updateIndicator({
        spreadIndex,
        leftPage,
        rightPage,
        totalSpreads: Math.ceil(flatPages.length / 2)
      });
    }
  }

  window.CodexPageLoader = {
    loadSpread,
    getTotalSpreads: () => Math.ceil(flatPages.length / 2)
  };
})();
