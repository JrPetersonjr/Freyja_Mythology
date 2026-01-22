// Arcane_Blue Beta 1
// Orchestrator for Blueberry → Purifier → Weaver + Hotpatcher

window.ArcaneBlue = {

  config: {
    manifestUrl: "assets/codex_slices/manifest_freyja.json"
  },

  state: {
    lastManifest: null
  },

  // --- PUBLIC API ---------------------------------------------------

  async init(options = {}) {
    this.config = { ...this.config, ...options };

    console.log("[ArcaneBlue] Initialized with config:", this.config);

    // Optionally preload manifest
    try {
      await this.reloadManifest();
    } catch (e) {
      console.warn("[ArcaneBlue] Could not preload manifest:", e);
    }
  },

  async reloadManifest() {
    console.log("[ArcaneBlue] Reloading manifest:", this.config.manifestUrl);

    const res = await fetch(this.config.manifestUrl);
    if (!res.ok) {
      throw new Error(`Failed to load manifest: ${res.status} ${res.statusText}`);
    }

    const manifest = await res.json();
    this.state.lastManifest = manifest;

    if (window.FREYJA_CONTENT_MAP) {
      this.attachSlicesToContentMap(manifest, window.FREYJA_CONTENT_MAP);
    }

    if (typeof window.WeaverV2 !== "undefined" && typeof window.WeaverV2.refresh === "function") {
      window.WeaverV2.refresh();
    }

    console.log("[ArcaneBlue] Manifest reloaded and applied.");
    return manifest;
  },

  // Placeholder: in future, trigger Blueberry pipeline
  async runBlueberry() {
    console.log("[ArcaneBlue] runBlueberry() called (Beta 1 stub).");
    alert("Blueberry run would be triggered here (stub).");
  },

  // Placeholder: in future, call SVG Purifier
  async runPurifier() {
    console.log("[ArcaneBlue] runPurifier() called (Beta 1 stub).");
    alert("SVG Purifier would be triggered here (stub).");
  },

  async applyHtmlPatch(patchOptions) {
    if (!window.ArcaneBlueHotpatcher) {
      throw new Error("ArcaneBlueHotpatcher is not loaded.");
    }

    console.log("[ArcaneBlue] Applying HTML patch with options:", patchOptions);
    const result = await window.ArcaneBlueHotpatcher.applyPatch(patchOptions);
    console.log("[ArcaneBlue] Patch result:", result);

    return result;
  },

  // --- INTERNAL HELPERS --------------------------------------------

  attachSlicesToContentMap(manifest, contentMap) {
    if (!manifest || !manifest.slices) return;

    manifest.slices.forEach(slice => {
      contentMap.forEach(chapter => {
        Object.values(chapter.pages).forEach(page => {
          if (
            page.headingMain &&
            slice.id &&
            normalizeId(page.headingMain) === normalizeId(slice.id)
          ) {
            page.sliceSvg = slice.cleanSvgPath;
          } else if (
            typeof page === "object" &&
            page.startPage === slice.pageStart &&
            page.endPage === slice.pageEnd
          ) {
            page.sliceSvg = slice.cleanSvgPath;
          }
        });
      });
    });

    function normalizeId(str) {
      return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    }
  }
};


// Auto-init when DOM is ready if desired
document.addEventListener("DOMContentLoaded", () => {
  if (window.ArcaneBlue) {
    window.ArcaneBlue.init();
  }
});
