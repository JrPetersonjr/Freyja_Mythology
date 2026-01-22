// js/tabs.js

(function () {
  const map = window.FREYJA_CONTENT_MAP;
  if (!map || !Array.isArray(map.chapters)) return;

  const tabRail = document.getElementById("codex-tab-rail");
  if (!tabRail) return;

  // You can style these classes in tabs.css
  function createTab(chapter, index) {
    const tab = document.createElement("button");
    tab.className = "codex-tab";
    tab.type = "button";
    tab.dataset.chapterId = chapter.id;
    tab.dataset.chapterIndex = index.toString();
    tab.textContent = chapter.tabLabel || chapter.title || `Chapter ${index + 1}`;
    tab.addEventListener("click", () => {
      if (window.CodexNavigation && typeof window.CodexNavigation.goToChapter === "function") {
        window.CodexNavigation.goToChapter(index);
      }
    });
    return tab;
  }

  function populateTabs() {
    tabRail.innerHTML = "";
    map.chapters.forEach((chapter, index) => {
      const tab = createTab(chapter, index);
      tabRail.appendChild(tab);
    });
  }

  // Expose a small API in case you want to refresh later
  window.CodexTabs = {
    populate: populateTabs
  };

  populateTabs();
})();
