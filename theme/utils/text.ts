/** Restaurant name as visitors know it: the page title without the " - Best Food Today" agency suffix. */
export const siteName = (title?: string) => (title ?? "").replace(/\s*[-\u2013\u2014|]\s*Best Food Today\s*$/i, "").trim();

/** True when a title/description (string or list of strings) has any visible text. */
export const hasText = (value?: unknown) =>
  (Array.isArray(value) ? value : [value]).some((v) => String(v ?? "").replace(/<[^>]*>/g, "").trim() !== "");

/** Meta description fallback: the first non-empty section description of the page, trimmed to ~160 characters. */
export function firstDescription(sections?: any[]): string {
  for (const section of sections ?? []) {
    const d = section?.description;
    for (const line of Array.isArray(d) ? d : [d]) {
      const text = String(line ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (text) return text.length <= 160 ? text : text.slice(0, 160).replace(/\s+\S*$/, "") + "…";
    }
  }
  return "";
}
