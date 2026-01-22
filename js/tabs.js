// js/tabs.js - Page-based tabs (one per page, like textbook bookmarks)

(function () {
  const contentMap = window.FREYJA_CONTENT_MAP;
  if (!contentMap || !Array.isArray(contentMap)) return;

  const tabRail = document.getElementById("codex-tab-rail");
  if (!tabRail) return;

  // Create a tab for each page
  function createTab(pageIndex, spreadIndex, label) {
    const tab = document.createElement("button");
    tab.className = "codex-tab";
    tab.type = "button";
    tab.dataset.pageIndex = pageIndex;
    tab.dataset.spreadIndex = spreadIndex;
    tab.textContent = label;
    
    tab.addEventListener("click", () => {
      if (window.CodexNavigation && typeof window.CodexNavigation.goToSpread === "function") {
        window.CodexNavigation.goToSpread(spreadIndex);
      }
    });
    return tab;
  }

  function highlightActiveTab(spreadIndex) {
    const tabs = tabRail.querySelectorAll(".codex-tab");
    tabs.forEach(tab => {
      if (parseInt(tab.dataset.spreadIndex) === spreadIndex) {
        tab.classList.add("codex-tab--active");
      } else {
        tab.classList.remove("codex-tab--active");
      }
    });
  }

  function populateTabs() {
    tabRail.innerHTML = "";
    
    // Create one tab per page
    contentMap.forEach((section, sectionIndex) => {
      const pages = section.pages || {};
      Object.keys(pages).forEach(pageNum => {
        const pageIndex = parseInt(pageNum) - 1; // 0-indexed
        const spreadIndex = Math.floor(pageIndex / 2);
        const label = section.tabLabel || section.title || `Page ${pageNum}`;
        
        const tab = createTab(pageIndex, spreadIndex, label);
        tabRail.appendChild(tab);
      });
    });
  }

  // Expose API
  window.FREYJA_TABS = {
    buildTabs: populateTabs,
    highlightActive: highlightActiveTab
  };

  window.CodexTabs = {
    populate: populateTabs,
    highlightActive: highlightActiveTab
  };
})();
