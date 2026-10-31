/** Language of a page: the explicit locale if the page sets one, else guessed from the URL, else English. */
export function pageLang(pathname: string, locale?: string): string {
  if (locale) return locale.replace("_", "-");
  const p = pathname.toLowerCase();
  if (/\/zh[-_]?cn(\/|$)/.test(p)) return "zh-CN";
  if (/\/zh[-_]?(tw|hk)?(\/|$)/.test(p)) return "zh-TW";
  return "en";
}

export const isChinese = (lang: string) => lang.toLowerCase().startsWith("zh");
