import os
import textwrap
from datetime import datetime
from tkinter import (
    Tk, Text, Label, Button, Scrollbar, RIGHT, Y, LEFT, BOTH, END, X, Frame,
    Menu, Listbox, SINGLE, filedialog, StringVar
)

# ------------- CONFIG -------------
DEFAULT_EXPORT_DIR = r"H:\AIRLOCK\EXPORTS\BLUEBERRY_SVG"
FONT_FAMILY = "Cascadia Mono, Courier New, monospace"
FONT_SIZE = 16          # SVG font size (px)
LINE_WIDTH_CHARS = 120  # characters per line
PADDING_X = 40
PADDING_Y = 60
LINE_SPACING = 6        # extra px between lines
MAX_SLICE_HEIGHT = 1800 # px (virtual page height)
BG_COLOR = "#FFFFFF"
TEXT_COLOR = "#000000"
HEADER_COLOR = "#505050"
STUDENT_MARK_COLOR = "#FF0000"  # bright red
# ----------------------------------


def normalize_text(raw_text: str, line_width: int) -> str:
    raw_text = raw_text.replace("\r\n", "\n").replace("\r", "\n")
    lines = raw_text.split("\n")
    wrapped_lines = []
    for line in lines:
        if line.strip() == "":
            wrapped_lines.append("")
        else:
            wrapped_lines.extend(textwrap.wrap(line, width=line_width))
    return "\n".join(wrapped_lines)


def build_svg_slice(slice_lines, slice_index, total_slices, width, height):
    svg_parts = []
    svg_parts.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}">'
    )
    svg_parts.append(f'<rect width="100%" height="100%" fill="{BG_COLOR}" />')

    header_text = f"[Blueberry Slice {slice_index}/{total_slices}]"
    header_y = PADDING_Y - (FONT_SIZE + LINE_SPACING)
    svg_parts.append(
        f'<text x="{PADDING_X}" y="{header_y}" '
        f'font-family="{FONT_FAMILY}" font-size="{FONT_SIZE}" '
        f'fill="{HEADER_COLOR}">{header_text}</text>'
    )

    y = PADDING_Y
    line_height = FONT_SIZE + LINE_SPACING
    for line in slice_lines:
        safe_line = (line
                     .replace("&", "&amp;")
                     .replace("<", "&lt;")
                     .replace(">", "&gt;"))
        svg_parts.append(
            f'<text x="{PADDING_X}" y="{y}" '
            f'font-family="{FONT_FAMILY}" font-size="{FONT_SIZE}" '
            f'fill="{TEXT_COLOR}">{safe_line}</text>'
        )
        y += line_height

    svg_parts.append(
        f'<text x="{PADDING_X}" y="{height - PADDING_Y/2}" '
        f'font-family="{FONT_FAMILY}" font-size="{FONT_SIZE}" '
        f'fill="{STUDENT_MARK_COLOR}" font-weight="bold">'
        f'&gt;STUDENT CODE DON&apos;T DELETE&lt;'
        f'</text>'
    )

    svg_parts.append('</svg>')
    return "\n".join(svg_parts)


def render_slices_svg(text: str, export_dir: str, status_var: StringVar):
    if not text.strip():
        status_var.set("Status: No text to export")
        return

    if not export_dir:
        status_var.set("Status: No export location set")
        return

    norm_text = normalize_text(text, LINE_WIDTH_CHARS)
    lines = norm_text.split("\n")

    line_height = FONT_SIZE + LINE_SPACING

    slices = []
    current_lines = []
    current_height = PADDING_Y * 2

    for line in lines:
        if (current_height + line_height > MAX_SLICE_HEIGHT) and current_lines:
            slices.append(current_lines)
            current_lines = []
            current_height = PADDING_Y * 2
        current_lines.append(line)
        current_height += line_height

    if current_lines:
        slices.append(current_lines)

    ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    session_dir = os.path.join(export_dir, f"BLUEBERRY_{ts}")
    os.makedirs(session_dir, exist_ok=True)

    width = 1600
    for idx, slice_lines in enumerate(slices, start=1):
        height = PADDING_Y * 2 + len(slice_lines) * line_height + FONT_SIZE + 10
        svg_content = build_svg_slice(
            slice_lines=slice_lines,
            slice_index=idx,
            total_slices=len(slices),
            width=width,
            height=height
        )
        filename = os.path.join(session_dir, f"slice_{idx:03d}.svg")
        with open(filename, "w", encoding="utf-8") as f:
            f.write(svg_content)

    try:
        os.startfile(session_dir)
    except Exception:
        pass

    status_var.set(f"Status: Exported {len(slices)} SVG slice(s) to {session_dir}")


def main():
    root = Tk()
    root.title("Blueberry Mini Win98 — SVG Explorer")
    root.geometry("1000x650")
    root.configure(bg="#C0C0C0")

    status_var = StringVar()
    status_var.set("Status: Ready")
    export_dir_var = StringVar()
    export_dir_var.set(DEFAULT_EXPORT_DIR)

    # ----- Menu Bar -----
    menubar = Menu(root)

    def do_select_file():
        filename = filedialog.askopenfilename(
            title="Select text file",
            filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        if filename:
            try:
                with open(filename, "r", encoding="utf-8") as f:
                    content = f.read()
                text_box.delete("1.0", END)
                text_box.insert("1.0", content)
                status_var.set(f"Status: Loaded file {os.path.basename(filename)}")
            except Exception as e:
                status_var.set(f"Status: Error loading file: {e}")

    def do_export_location():
        folder = filedialog.askdirectory(
            title="Select export location",
            initialdir=export_dir_var.get() or DEFAULT_EXPORT_DIR
        )
        if folder:
            export_dir_var.set(folder)
            status_var.set(f"Status: Export location set to {folder}")

    def do_export():
        raw_text = text_box.get("1.0", END)
        render_slices_svg(raw_text, export_dir_var.get(), status_var)

    def do_copy():
        try:
            selected = text_box.get("sel.first", "sel.last")
            root.clipboard_clear()
            root.clipboard_append(selected)
            status_var.set("Status: Copied selection")
        except Exception:
            status_var.set("Status: Nothing selected to copy")

    def do_paste():
        try:
            clip = root.clipboard_get()
            text_box.insert("insert", clip)
            status_var.set("Status: Pasted from clipboard")
        except Exception:
            status_var.set("Status: Clipboard empty")

    file_menu = Menu(menubar, tearoff=0)
    file_menu.add_command(label="Select File...", command=do_select_file)
    file_menu.add_command(label="Export Location...", command=do_export_location)
    file_menu.add_separator()
    file_menu.add_command(label="Export", command=do_export)
    file_menu.add_separator()
    file_menu.add_command(label="Exit", command=root.quit)
    menubar.add_cascade(label="File", menu=file_menu)

    edit_menu = Menu(menubar, tearoff=0)
    edit_menu.add_command(label="Copy", command=do_copy)
    edit_menu.add_command(label="Paste", command=do_paste)
    menubar.add_cascade(label="Edit", menu=edit_menu)

    export_menu = Menu(menubar, tearoff=0)
    export_menu.add_command(label="Export SVG Slices", command=do_export)
    menubar.add_cascade(label="Export", menu=export_menu)

    help_menu = Menu(menubar, tearoff=0)
    help_menu.add_command(label="About", command=lambda: status_var.set("Status: Blueberry Mini Win98 — SVG Edition"))
    menubar.add_cascade(label="Help", menu=help_menu)

    root.config(menu=menubar)

    # ----- Title Bar Strip -----
    title_label = Label(
        root,
        text="Blueberry Mini Win98 — Text → SVG Slices",
        bg="#000080",
        fg="#FFFFFF",
        padx=8,
        pady=4,
        anchor="w"
    )
    title_label.pack(fill=X)

    # ----- Main Area -----
    main_frame = Frame(root, bg="#C0C0C0")
    main_frame.pack(fill=BOTH, expand=True, padx=4, pady=4)

    # Left: Tree View (placeholder)
    tree_frame = Frame(main_frame, bg="#C0C0C0", width=200)
    tree_frame.pack(side=LEFT, fill=Y)
    tree_frame.pack_propagate(False)

    tree_label = Label(tree_frame, text="Navigation", bg="#C0C0C0", fg="#000000", anchor="w")
    tree_label.pack(fill=X, padx=4, pady=(4, 2))

    tree_list = Listbox(tree_frame, selectmode=SINGLE, bg="#FFFFFF", fg="#000000")
    tree_list.pack(fill=BOTH, expand=True, padx=4, pady=4)

    tree_list.insert(END, "AIRLOCK")
    tree_list.insert(END, "EXPORTS")
    tree_list.insert(END, "BLUEBERRY_SVG")
    tree_list.insert(END, "SESSIONS")

    # Right: Text Editor
    editor_frame = Frame(main_frame, bg="#C0C0C0")
    editor_frame.pack(side=LEFT, fill=BOTH, expand=True)

    text_frame = Frame(editor_frame, bg="#C0C0C0")
    text_frame.pack(fill=BOTH, expand=True, padx=4, pady=4)

    scrollbar = Scrollbar(text_frame)
    scrollbar.pack(side=RIGHT, fill=Y)

    global text_box
    text_box = Text(
        text_frame,
        wrap="word",
        yscrollcommand=scrollbar.set,
        font=("Consolas", 11),
        bg="#FFFFFF",
        fg="#000000",
        insertbackground="#000000"
    )
    text_box.pack(side=LEFT, fill=BOTH, expand=True)
    scrollbar.config(command=text_box.yview)

    # ----- Status Bar -----
    status_bar = Label(
        root,
        textvariable=status_var,
        bg="#C0C0C0",
        fg="#000000",
        anchor="w"
    )
    status_bar.pack(fill=X, side="bottom")

    root.mainloop()


if __name__ == "__main__":
    main()
