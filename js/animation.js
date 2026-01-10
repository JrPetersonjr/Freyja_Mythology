// Freyja Codex – Animation Engine
// Gives motion to vellum: page curl, fire-kiss, and timing between states.

(function () {
  const turnPageEl = document.getElementById("codex-page-turn");
  const turnInner = turnPageEl?.querySelector(".codex-page-inner");
  const fireEl = turnPageEl?.querySelector(".codex-fire-kiss");
  const leftEl = document.getElementById("codex-page-left")?.querySelector(".codex-page-inner");
  const rightEl = document.getElementById("codex-page-right")?.querySelector(".codex-page-inner");

  function cloneCurrentSideToTurn(direction, currentPage) {
    if (!turnInner || !leftEl || !rightEl) return;
    const isCurrentLeft = currentPage % 2 === 0;
    const sourceEl = direction === "forward" ? rightEl : leftEl;
    turnInner.innerHTML = sourceEl.innerHTML;
  }

  function prepareTurn(direction) {
    if (!turnPageEl) return;
    turnPageEl.style.opacity = "1";
    turnPageEl.classList.remove(
      "codex-page--turning-forward",
      "codex-page--turning-backward"
    );
    void turnPageEl.offsetWidth; // force reflow
    if (direction === "forward") {
      turnPageEl.classList.add("codex-page--turning-forward");
    } else {
      turnPageEl.classList.add("codex-page--turning-backward");
    }

    if (fireEl) {
      fireEl.classList.remove("codex-fire-kiss--active");
      void fireEl.offsetWidth;
      fireEl.classList.add("codex-fire-kiss--active");
    }
  }

  function completeTurn() {
    if (!turnPageEl) return;
    turnPageEl.style.opacity = "0";
    turnInner && (turnInner.innerHTML = "");
  }

  window.addEventListener("codex:requestTurn", (evt) => {
    const { direction, targetPage } = evt.detail;
    const state = window.FREYJA_NAV.getState();
    if (state.isTurning) return;

    window.FREYJA_NAV.setTurning(true);

    cloneCurrentSideToTurn(direction, state.currentPage);
    prepareTurn(direction);

    // Approximate sync with CSS keyframes (0.9s)
    setTimeout(() => {
      window.FREYJA_NAV.setCurrentPage(targetPage);
      completeTurn();
      window.FREYJA_NAV.setTurning(false);
    }, 900);
  });
})();
