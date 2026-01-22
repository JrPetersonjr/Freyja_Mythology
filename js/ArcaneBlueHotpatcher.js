// Arcane_Blue Beta 1
// HTML hotpatcher core (no file writing yet, just transform + return)

window.ArcaneBlueHotpatcher = {

  /**
   * patchOptions:
   * {
   *   file: "index.html",         // URL to fetch
   *   mode: "insertAfter" | "insertBefore" | "replaceBlock" | "replaceLine" | "append" | "prepend",
   *   target: "<body>",           // string or marker, or line number for replaceLine
   *   endMarker: "</head>",       // only for replaceBlock
   *   code: "<script>...</script>"
   * }
   */
  async applyPatch(patchOptions) {
    const { file } = patchOptions;

    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${file}`);
    }

    const original = await response.text();
    const snapshot = original.split("\n");

    const updated = this._applyMode(original, patchOptions);
    const updatedLines = updated.split("\n");

    return {
      file,
      snapshotLines: snapshot,
      updatedLines,
      updatedText: updated
    };
  },

  _applyMode(text, options) {
    const { mode, target, endMarker, code } = options;

    switch (mode) {
      case "insertAfter":
        return this.insertAfter(text, String(target), code);

      case "insertBefore":
        return this.insertBefore(text, String(target), code);

      case "replaceBlock":
        return this.replaceBlock(text, String(target), String(endMarker), code);

      case "replaceLine":
        return this.replaceLine(text, Number(target), code);

      case "append":
        return text + "\n" + code + "\n";

      case "prepend":
        return code + "\n" + text;

      default:
        console.warn("[ArcaneBlueHotpatcher] Unknown mode:", mode);
        return text;
    }
  },

  insertAfter(text, target, code) {
    const idx = text.indexOf(target);
    if (idx === -1) {
      console.warn("[ArcaneBlueHotpatcher] insertAfter: target not found:", target);
      return text;
    }
    const insertPos = idx + target.length;
    return text.slice(0, insertPos) + "\n" + code + "\n" + text.slice(insertPos);
  },

  insertBefore(text, target, code) {
    const idx = text.indexOf(target);
    if (idx === -1) {
      console.warn("[ArcaneBlueHotpatcher] insertBefore: target not found:", target);
      return text;
    }
    return text.slice(0, idx) + code + "\n" + text.slice(idx);
  },

  replaceLine(text, lineNumber, code) {
    const lines = text.split("\n");
    const idx = lineNumber - 1;
    if (idx < 0 || idx >= lines.length) {
      console.warn("[ArcaneBlueHotpatcher] replaceLine: out of range:", lineNumber);
      return text;
    }
    lines[idx] = code;
    return lines.join("\n");
  },

  replaceBlock(text, startMarker, endMarker, code) {
    const start = text.indexOf(startMarker);
    const end = text.indexOf(endMarker);
    if (start === -1 || end === -1 || end <= start) {
      console.warn("[ArcaneBlueHotpatcher] replaceBlock: markers not found or invalid.");
      return text;
    }

    const head = text.slice(0, start + startMarker.length);
    const tail = text.slice(end);

    return head + "\n" + code + "\n" + tail;
  }
};
