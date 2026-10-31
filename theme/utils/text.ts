/** Restaurant name as visitors know it: the page title without the " - Best Food Today" agency suffix. */
export const siteName = (title?: string) => (title ?? "").replace(/\s*[-\u2013\u2014|]\s*Best Food Today\s*$/i, "").trim();
