export const formatRs = (n: number): string =>
  `Rs. ${Math.round(n).toLocaleString("en-IN")}`;

export const pluralize = (n: number, singular: string, plural?: string) =>
  `${n} ${n === 1 ? singular : plural ?? singular + "s"}`;
