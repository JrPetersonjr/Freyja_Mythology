// js/navigation.js

(function () {
  const prevBtn = document.getElementById("codex-prev");
  const nextBtn = document.getElementById("codex-next");
  const indicatorEl = document.getElementById("codex-page-indicator");

  let currentSpread = 0;
  let totalSpreads = 0;
  let chapterStartSpreadByIndex = []; // maps chapterIndex -> spread index

  function computeChapterSpreads() {
    const map = window.FREYJA_CONTENT_MAP;
    if (!map || !Array.isArray(map.chapters)) return;

    chapterStartSpreadByIndex = [];

    let pageCountBefore = 0;
    map.chapters.forEach((chapter, chapterIndex) => {
      const pageNumbers = Object.keys(chapter.pages || {}).length;
      const startSpread = Math.floor(pageCountBefore / 2);
      chapterStartSpreadByIndex[chapterIndex] = startSpread;
      pageCountBefore += pageNumbers;
    });
  }

  function updateIndicator(meta) {
    if (!indicatorEl || !meta) return;
    const { spreadIndex, totalSpreads } = meta;
    indicatorEl.textContent = `Spread ${spreadIndex + 1} / ${totalSpreads}`;
  }

  function goToSpread(index) {
    const loader = window.CodexPageLoader;
    if (!loader) return;

    const maxSpread = loader.getTotalSpreads() - 1;
    const clamped = Math.max(0, Math.min(index, maxSpread));

    currentSpread = clamped;
    totalSpreads = loader.getTotalSpreads();
    loader.loadSpread(currentSpread);
    
    // Highlight active tab
    if (window.FREYJA_TABS && typeof window.FREYJA_TABS.highlightActive === "function") {
      window.FREYJA_TABS.highlightActive(currentSpread);
    }
  }

  function next() {
    goToSpread(currentSpread + 1);
  }

  function prev() {
    goToSpread(currentSpread - 1);
  }

  function goToChapter(chapterIndex) {
    if (chapterIndex < 0 || chapterIndex >= chapterStartSpreadByIndex.length) return;
    const spread = chapterStartSpreadByIndex[chapterIndex];
    goToSpread(spread);
  }

  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (nextBtn) nextBtn.addEventListener("click", next);

  computeChapterSpreads();

  window.CodexNavigation = {
    goToSpread,
    next,
    prev,
    goToChapter,
    updateIndicator
  };
})();
