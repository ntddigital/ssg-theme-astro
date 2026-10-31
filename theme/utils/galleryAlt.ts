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
  // File names written like "Braised-Prawns-Sweet-Sour-Sauce-0" (hyphens as spaces, a counter at the end) read badly
  // aloud: treat a name with three or more such hyphens as words and drop the counter.
  let raw = String(name || "");
  const hyphens = (raw.match(/[A-Za-z]-(?=[A-Za-z])/g) || []).length + (/-\d{1,2}$/.test(raw) ? 1 : 0);
  if (hyphens >= 3) raw = raw.replace(/-\d{1,2}$/, "").replace(/([A-Za-z])-(?=[A-Za-z])/g, "$1 ");
  const text = raw
    .replace(/^[\d_\-\s]+/, "")
    // a stray extension left in the file name, e.g. "Sweet and Sour Pork webp.webp"
    .replace(/[\s.]+(webp|jpe?g|png|avif|gif)$/i, "")
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

// The caption Gallery prints under an image when `showImgName` is on: the file name with "__" splitting
// the parts and "_" shown as a space. Mirrors the markup in Gallery.astro.
export function galleryCaption(name: string): string {
  return String(name || "")
    .split("__")
    .map((part) => part.replace(/_/g, " ").replace(/w:o/g, "w/o").replace(/w:/g, "w/").trim())
    .filter(Boolean)
    .join(" ");
}

const squash = (text: string) =>
  String(text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/^[\d\s_.\-]+/, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");

// True when a visible caption says the same thing as the alt text (ignoring case, spacing, punctuation,
// a leading number, and the "、" the alt uses between languages), or nearly so (one contains the other and
// covers at least 80% of it). Then the image is decorative next to its caption and should get alt="".
export function captionRepeatsAlt(alt: string, caption: string): boolean {
  const a = squash(alt);
  const c = squash(caption);
  if (!a || !c) return false;
  if (a === c) return true;
  const [short, long] = a.length <= c.length ? [a, c] : [c, a];
  return short.length >= 4 && long.includes(short) && short.length / long.length >= 0.8;
}
