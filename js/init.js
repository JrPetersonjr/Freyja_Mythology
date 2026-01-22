// Freyja Codex – Init & Ritual Entry
// From closed leather to breathing pages: the first opening of the Codex.

(function () {
  const coverEl = document.getElementById("codex-cover");
  const openBtn = document.getElementById("codex-open-button");
  const bookEl = document.getElementById("codex-book");
  const railEl = document.getElementById("codex-tab-rail");
  const nextBtn = document.getElementById("codex-next");
  const prevBtn = document.getElementById("codex-prev");

  function showBook() {
    if (coverEl) {
      coverEl.classList.add("codex-cover--hidden");
    }
    if (bookEl) {
      bookEl.classList.remove("codex-book--hidden");
      bookEl.classList.add("codex-book--visible");
    }
    if (railEl) {
      railEl.classList.remove("codex-tab-rail--hidden");
      railEl.classList.add("codex-tab-rail--visible");
    }

    // Initial page
    window.FREYJA_NAV.setCurrentPage(1);
  }

  function bindEvents() {
    if (openBtn) {
      openBtn.addEventListener("click", showBook);
    } else if (coverEl) {
      coverEl.addEventListener("click", showBook);
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        window.FREYJA_NAV.turnNext();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        window.FREYJA_NAV.turnPrev();
      });
    }
  }

  function init() {
    // Defensive check to ensure FREYJA_TABS exists
    if (window.FREYJA_TABS && typeof window.FREYJA_TABS.buildTabs === 'function') {
      window.FREYJA_TABS.buildTabs();
    } else {
      console.error('FREYJA_TABS.buildTabs not available. Check that tabs.js loaded correctly.');
    }
    bindEvents();
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
