// Turns a gallery image into alt text.
// `name` is the formatted file name from readImages (no extension), `src` the file path.
// `overrides` is the optional `altOverrides` map of a gallery section
// (file name with or without extension -> alt text) and always wins.
export function galleryAlt(
  name: string,
  src: string,
  overrides?: Record<string, unknown> | null
): string {
  if (overrides && typeof overrides === "object") {
    const base = String(src || "").split("/").pop() || "";
    const stem = base.replace(/\.[^/.]+$/, "");
    for (const key of [base, stem, name]) {
      if (key && Object.prototype.hasOwnProperty.call(overrides, key)) {
        const value = overrides[key];
        if (typeof value === "string") return value.trim();
      }
    }
  }
  const text = String(name || "")
    .replace(/^[\d_\-\s]+/, "")
    .replace(/__/g, "、")
    .replace(/_/g, " ")
    .replace(/w:o/g, "w/o")
    .replace(/w:/g, "w/")
    .replace(/\s+/g, " ")
    .replace(/[、\s]+$/, "")
    .trim();
  if (!text || /^\d+$/.test(text)) return "";
  return text;
}
