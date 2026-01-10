// Freyja Codex – Tabs
// The chapter markers that ride the book's edges and glow when their realm is entered.

(function () {
  const railEl = document.getElementById("codex-tab-rail");

  function buildTabs() {
    if (!railEl) return;
    railEl.innerHTML = "";
    const chapters = window.FREYJA_CONTENT_MAP.chapters;
    chapters.forEach((ch) => {
      const tab = document.createElement("button");
      tab.className = "codex-tab codex-tab--right";
      tab.textContent = ch.tabLabel || ch.title;
      tab.setAttribute("data-chapter-id", ch.id);
      tab.addEventListener("click", () => {
        const event = new CustomEvent("codex:tabClick", { detail: { chapter: ch } });
        window.dispatchEvent(event);
      });
      railEl.appendChild(tab);
    });
  }

  function updateActiveTab(currentPage) {
    const chapters = window.FREYJA_CONTENT_MAP.chapters;
    const chapter = chapters.find(
      (ch) => currentPage >= ch.startPage && currentPage <= ch.endPage
    );
    if (!railEl || !chapter) return;

    const tabs = railEl.querySelectorAll(".codex-tab");
    tabs.forEach((tab) => {
      const id = tab.getAttribute("data-chapter-id");
      tab.classList.toggle("codex-tab--active", id === chapter.id);

      const isRightSide = currentPage % 2 === 1;
      tab.classList.toggle("codex-tab--right", isRightSide);
      tab.classList.toggle("codex-tab--left", !isRightSide);
    });
  }

  window.addEventListener("codex:pageChange", (evt) => {
    updateActiveTab(evt.detail.currentPage);
  });

  window.addEventListener("codex:tabClick", (evt) => {
    const chapter = evt.detail.chapter;
    // Ritual rule: tab click always leads to the chapter's first page
    const targetPage = chapter.startPage;
    const current = window.FREYJA_NAV.getState().currentPage;
    if (targetPage === current) return;

    const direction = targetPage > current ? "forward" : "backward";
    const event = new CustomEvent("codex:requestTurn", {
      detail: { direction, targetPage }
    });
    window.dispatchEvent(event);
  });

  window.FREYJA_TABS = {
    buildTabs
  };
})();
