/** Colour helpers for readable text. Content files give colours as hex strings. */

function parseHex(hex: unknown): [number, number, number] | null {
  if (typeof hex !== "string") return null;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** WCAG relative luminance, 0 (black) to 1 (white). Returns null for colours it cannot read. */
export function luminance(hex: unknown): number | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const WHITE = 1;
const BLACK = 0;
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/**
 * Text colour for a button or banner with the given background.
 * `force` (content: forceButtonTextColor) wins. Otherwise the site's chosen scheme
 * ("dark" = white text, anything else = black text) is kept when it is readable (4.5:1),
 * and only flipped when it is not.
 */
export function buttonTextColor(background: unknown, scheme: unknown, force?: unknown): string {
  if (typeof force === "string" && force.trim()) return force.trim();
  const preferWhite = scheme === "dark";
  const bg = luminance(background);
  if (bg === null) return preferWhite ? "#ffffff" : "#000000";
  const preferred = preferWhite ? WHITE : BLACK;
  const other = preferWhite ? BLACK : WHITE;
  const hex = (v: number) => (v === WHITE ? "#ffffff" : "#000000");
  if (ratio(bg, preferred) >= 4.5) return hex(preferred);
  return ratio(bg, other) > ratio(bg, preferred) ? hex(other) : hex(preferred);
}

/**
 * Opacity of the black layer to put between a hero photo/video and its text.
 * - `heroScrim` in the content wins (0 turns the layer off).
 * - Dark or unset text colours get none: a black layer would hurt them.
 * - Light text gets enough to reach `target` total darkness, counting the dark overlay the site already has.
 */
export function heroScrimAlpha(section: any, target = 0.5): number {
  const explicit = section?.heroScrim;
  if (explicit !== undefined && explicit !== null && explicit !== "") {
    const n = Number(explicit);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
  }
  const textLum = luminance(section?.titleColor) ?? luminance(section?.descriptionColor);
  if (textLum === null || textLum < 0.5) return 0;
  const overlayLum = luminance(section?.bgColor);
  const opacity = Number(section?.bgOpacity);
  const existing = overlayLum !== null && overlayLum < 0.2 ? (Number.isFinite(opacity) ? opacity : 1) : 0;
  if (existing >= target) return 0;
  return Math.round((1 - (1 - target) / (1 - existing)) * 1000) / 1000;
}
