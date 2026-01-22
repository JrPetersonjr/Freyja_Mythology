// js/pageLoader.js
// Freyja Codex Page Loader – final illuminated version

(function () {
  // ---- Guard: content map must exist ----
  const map = window.FREYJA_CONTENT_MAP;
  if (!map) return;

  // Support either:
  // - window.FREYJA_CONTENT_MAP = [ ...chapters ]
  // - window.FREYJA_CONTENT_MAP = { chapters: [ ...chapters ] }
  const chapters = Array.isArray(map)
    ? map
    : Array.isArray(map.chapters)
      ? map.chapters
      : [];

  if (!chapters.length) return;

  // ---- DOM references ----
  const leftInner  = document.querySelector('#codex-page-left .codex-page-inner');
  const rightInner = document.querySelector('#codex-page-right .codex-page-inner');
  const fireKissEl = document.querySelector('.codex-fire-kiss');

  if (!leftInner || !rightInner) return;

  // ---- Flatten chapters into linear page list ----
  const flatPages = [];

  chapters.forEach((chapter, chapterIndex) => {
    const pageNumbers = Object.keys(chapter.pages || {})
      .map(n => parseInt(n, 10))
      .filter(n => !Number.isNaN(n))
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

  if (!flatPages.length) return;

  // ---- Helper: render marginalia block ----
  function renderMarginalia(d) {
    const m = d.marginalia;
    if (!m || !m.scribe) return "";

    const inkClass = m.ink ? ` ink-${m.ink}` : "";
    const placementClass = m.placement ? ` codex-marginalia--${m.placement}` : "";

    return `
      <aside class="codex-marginalia${placementClass}${inkClass}">
        <span class="codex-marginalia-scribe">${m.scribe}</span>
      </aside>
    `;
  }

  // ---- Helper: render runic annotation block ----
  function renderRunic(d) {
    const r = d.runic;
    if (!r || !r.futhark) return "";

    const styleClass = r.style ? ` runic-${r.style}` : "";

    return `
      <section class="codex-runic${styleClass}">
        <div class="codex-runic-text">${r.futhark}</div>
        ${r.meaning ? `<div class="codex-runic-meaning">${r.meaning}</div>` : ""}
      </section>
    `;
  }

  // ---- Helper: heading + sigil block ----
  function renderHeadingBlock(d, meta) {
    const rubric = d.headingRubric
      ? `<div class="codex-heading-rubric rubric">${d.headingRubric}</div>`
      : "";

    const headingMain = d.headingMain || meta.chapterTitle || "";
    const heading = headingMain
      ? `<h2 class="codex-heading-main">${headingMain}</h2>`
      : "";

    const sigilClass = d.sigil ? ` ${d.sigil}` : "";
    const sigil = d.sigil
      ? `<div class="codex-sigil${sigilClass}"></div>`
      : "";

    const chapterRibbon = meta.chapterTitle
      ? `<div class="codex-chapter-ribbon">${meta.chapterTitle}</div>`
      : "";

    return `
      <header class="codex-page-header">
        ${sigil}
        <div class="codex-heading-block">
          ${rubric}
          ${heading}
        </div>
        ${chapterRibbon}
      </header>
    `;
  }

  // ---- Helper: body paragraphs for text pages ----
  function renderTextBody(d) {
    const body = Array.isArray(d.body) ? d.body : [];
    const dropcap = d.dropcap || "";

    if (!body.length) return "";

    return body
      .map((para, index) => {
        if (index === 0 && dropcap) {
          // Dropcap on first paragraph
          return `<p class="codex-paragraph codex-paragraph--dropcap"><span class="dropcap">${dropcap}</span>${para.slice(1)}</p>`;
        }
        return `<p class="codex-paragraph">${para}</p>`;
      })
      .join("");
  }

  // ---- Helper: image block for image pages ----
  function renderImageBlock(d) {
    if (!d.src) return "";

    const alt = d.headingMain || "";
    const caption = d.caption
      ? `<figcaption class="codex-image-caption">${d.caption}</figcaption>`
      : "";

    // Optional dropcap could be used in caption or decorative block if desired
    const dropcap = d.dropcap
      ? `<div class="codex-image-dropcap"><span class="dropcap">${d.dropcap}</span></div>`
      : "";

    return `
      <figure class="codex-image-block">
        ${dropcap}
        <img src="${d.src}" alt="${alt}" class="codex-image" />
        ${caption}
      </figure>
    `;
  }

  // ---- Helper: empty / placeholder page ----
  function renderEmptyPage(targetEl) {
    targetEl.classList.add("codex-page-empty");
    targetEl.innerHTML = `
      <div class="codex-page-content codex-page-content--empty">
        <div class="codex-page-vellum-placeholder"></div>
      </div>
    `;
  }

  // ---- Core: render a single page into target ----
  function renderPage(targetEl, page) {
    if (!page || !page.data) {
      renderEmptyPage(targetEl);
      return;
    }

    const d = page.data;
    const meta = {
      chapterId: page.chapterId,
      chapterTitle: page.chapterTitle,
      logicalPage: page.logicalPage
    };

    const headingBlock = renderHeadingBlock(d, meta);
    const marginaliaBlock = renderMarginalia(d);
    const runicBlock = renderRunic(d);

    let coreContent = "";

    if (d.type === "image") {
      coreContent = renderImageBlock(d);
    } else {
      // Default to text
      coreContent = renderTextBody(d);
    }

    targetEl.classList.remove("codex-page-empty");
    targetEl.innerHTML = `
      <div class="codex-page-content codex-page-content--${d.type || "text"}">
        ${headingBlock}
        <main class="codex-page-main">
          ${coreContent}
        </main>
        ${marginaliaBlock}
        ${runicBlock}
      </div>
    `;
  }

  // ---- Fire-kiss animation trigger (optional, non-fatal) ----
  function triggerFireKiss() {
    if (!fireKissEl) return;
    fireKissEl.classList.remove("codex-fire-kiss--active");
    // Force reflow so the animation can restart
    // eslint-disable-next-line no-unused-expressions
    fireKissEl.offsetWidth;
    fireKissEl.classList.add("codex-fire-kiss--active");
  }

  // ---- Load a spread (two pages) by spread index ----
  function loadSpread(spreadIndex) {
    const totalSpreads = Math.ceil(flatPages.length / 2);
    const safeSpreadIndex = Math.max(0, Math.min(spreadIndex, totalSpreads - 1));

    const leftPageIndex  = safeSpreadIndex * 2;
    const rightPageIndex = safeSpreadIndex * 2 + 1;

    const leftPage  = flatPages[leftPageIndex]  || null;
    const rightPage = flatPages[rightPageIndex] || null;

    triggerFireKiss();
    renderPage(leftInner, leftPage);
    renderPage(rightInner, rightPage);

    if (window.CodexNavigation && typeof window.CodexNavigation.updateIndicator === "function") {
      window.CodexNavigation.updateIndicator({
        spreadIndex: safeSpreadIndex,
        leftPage,
        rightPage,
        totalSpreads
      });
    }
  }

  // ---- Public API ----
  window.CodexPageLoader = {
    loadSpread,
    getTotalSpreads: () => Math.ceil(flatPages.length / 2),
    getFlatPages: () => flatPages.slice()
  };
})();
