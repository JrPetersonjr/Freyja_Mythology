// Freyja Codex – Page Loader
// The invisible scribe who fills left and right pages with the correct chapter content.

(function () {
  const leftEl = document.getElementById("codex-page-left")?.querySelector(".codex-page-inner");
  const rightEl = document.getElementById("codex-page-right")?.querySelector(".codex-page-inner");

  function clearPage(el) {
    if (!el) return;
    el.innerHTML = "";
  }

  function renderTextPage(el, pageData) {
    if (!el) return;
    clearPage(el);

    if (pageData.headingRubric) {
      const rubric = document.createElement("div");
      rubric.className = "codex-heading-rubric";
      rubric.textContent = pageData.headingRubric;
      el.appendChild(rubric);
    }

    if (pageData.headingMain) {
      const main = document.createElement("div");
      main.className = "codex-heading-main";
      main.textContent = pageData.headingMain;
      el.appendChild(main);
    }

    if (pageData.sigil) {
      const sigil = document.createElement("div");
      sigil.className = "codex-chapter-sigil";
      // Background image or glyph can be set via CSS targeting data-sigil attribute if needed
      sigil.setAttribute("data-sigil-id", pageData.sigil);
      el.appendChild(sigil);
    }

    const bodyWrapper = document.createElement("div");
    bodyWrapper.className = "codex-body";

    if (pageData.dropcap && pageData.body && pageData.body.length > 0) {
      const firstPara = document.createElement("p");
      const drop = document.createElement("span");
      drop.className = "codex-dropcap";
      drop.textContent = pageData.dropcap;
      firstPara.appendChild(drop);
      firstPara.append(document.createTextNode(pageData.body[0].slice(1)));
      bodyWrapper.appendChild(firstPara);

      for (let i = 1; i < pageData.body.length; i++) {
        const p = document.createElement("p");
        p.textContent = pageData.body[i];
        bodyWrapper.appendChild(p);
      }
    } else if (pageData.body) {
      pageData.body.forEach((line) => {
        const p = document.createElement("p");
        p.textContent = line;
        bodyWrapper.appendChild(p);
      });
    }

    el.appendChild(bodyWrapper);
  }

  function renderImagePage(el, pageData) {
    if (!el) return;
    clearPage(el);

    if (pageData.headingRubric) {
      const rubric = document.createElement("div");
      rubric.className = "codex-heading-rubric";
      rubric.textContent = pageData.headingRubric;
      el.appendChild(rubric);
    }

    if (pageData.headingMain) {
      const main = document.createElement("div");
      main.className = "codex-heading-main";
      main.textContent = pageData.headingMain;
      el.appendChild(main);
    }

    if (pageData.sigil) {
      const sigil = document.createElement("div");
      sigil.className = "codex-chapter-sigil";
      sigil.setAttribute("data-sigil-id", pageData.sigil);
      el.appendChild(sigil);
    }

    const frame = document.createElement("div");
    frame.className = "codex-illustration-frame";

    const img = document.createElement("img");
    img.src = pageData.imageSrc;
    img.alt = pageData.imageAlt || "";
    frame.appendChild(img);

    el.appendChild(frame);
  }

  function getPageData(pageNumber) {
    const chapters = window.FREYJA_CONTENT_MAP.chapters;
    for (const ch of chapters) {
      if (pageNumber >= ch.startPage && pageNumber <= ch.endPage) {
        return ch.pages[pageNumber] || null;
      }
    }
    return null;
  }

  function loadPagesFor(pageNumber) {
    const leftNumber = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
    const rightNumber = leftNumber + 1;

    const leftData = getPageData(leftNumber);
    const rightData = getPageData(rightNumber);

    clearPage(leftEl);
    clearPage(rightEl);

    if (leftData) {
      if (leftData.type === "image") {
        renderImagePage(leftEl, leftData);
      } else {
        renderTextPage(leftEl, leftData);
      }
    }

    if (rightData) {
      if (rightData.type === "image") {
        renderImagePage(rightEl, rightData);
      } else {
        renderTextPage(rightEl, rightData);
      }
    }
  }

  window.addEventListener("codex:pageChange", (evt) => {
    loadPagesFor(evt.detail.currentPage);
    const indicator = document.getElementById("codex-page-indicator");
    if (indicator) {
      indicator.textContent = `Page ${evt.detail.currentPage}`;
    }
  });

  // Public API (small, for future extension)
  window.FREYJA_LOADER = {
    loadPagesFor
  };
})();
