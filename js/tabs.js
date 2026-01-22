// js/tabs.js - Page-based tabs (one per page, like textbook bookmarks)

(function () {
  // Define API immediately to ensure it exists
  window.FREYJA_TABS = window.FREYJA_TABS || {};
  window.CodexTabs = window.CodexTabs || {};
  
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
    const tabRail = document.getElementById("codex-tab-rail");
    if (!tabRail) return;
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
    const tabRail = document.getElementById("codex-tab-rail");
    const contentMap = window.FREYJA_CONTENT_MAP;
    if (!contentMap || !Array.isArray(contentMap) || !tabRail) return;
    
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

  // Attach methods to the already-defined API objects
  window.FREYJA_TABS.buildTabs = populateTabs;
  window.FREYJA_TABS.highlightActive = highlightActiveTab;
  
  window.CodexTabs.populate = populateTabs;
  window.CodexTabs.highlightActive = highlightActiveTab;
})();
