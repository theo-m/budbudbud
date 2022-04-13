export const getQueryParam = (s: string | string[] | undefined) =>
  Array.isArray(s) ? s[0] : s;
