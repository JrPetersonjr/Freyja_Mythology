// Freyja Codex – Navigation Logic
// The quiet law that decides where the reader stands: which page, which chapter, which side.

(function () {
  const state = {
    currentPage: 1,
    isTurning: false
  };

  function getChapters() {
    return window.FREYJA_CONTENT_MAP.chapters;
  }

  function findChapterForPage(pageNumber) {
    return getChapters().find(
      (ch) => pageNumber >= ch.startPage && pageNumber <= ch.endPage
    );
  }

  function getTotalPages() {
    const chapters = getChapters();
    const last = chapters[chapters.length - 1];
    return last.endPage;
  }

  function canTurnTo(pageNumber) {
    if (pageNumber < 1 || pageNumber > getTotalPages()) return false;
    return true;
  }

  function setCurrentPage(pageNumber) {
    state.currentPage = pageNumber;
    const event = new CustomEvent("codex:pageChange", {
      detail: {
        currentPage: state.currentPage,
        chapter: findChapterForPage(state.currentPage)
      }
    });
    window.dispatchEvent(event);
  }

  function turnNext() {
    if (state.isTurning) return;
    const target = state.currentPage + 1;
    if (!canTurnTo(target)) return;
    const event = new CustomEvent("codex:requestTurn", {
      detail: { direction: "forward", targetPage: target }
    });
    window.dispatchEvent(event);
  }

  function turnPrev() {
    if (state.isTurning) return;
    const target = state.currentPage - 1;
    if (!canTurnTo(target)) return;
    const event = new CustomEvent("codex:requestTurn", {
      detail: { direction: "backward", targetPage: target }
    });
    window.dispatchEvent(event);
  }

  // External API (lightweight, global but contained)
  window.FREYJA_NAV = {
    getState: () => ({ ...state }),
    setCurrentPage,
    turnNext,
    turnPrev,
    findChapterForPage,
    getTotalPages,
    setTurning: (value) => {
      state.isTurning = !!value;
    }
  };
})();
