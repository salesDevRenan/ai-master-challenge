const usdFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** US$ 18.948 */
export const usd = (value: number) => usdFormatter.format(value).replace(/\s/, " ");

/** 71% (ou 70,8% com `digits`) */
export const pct = (ratio: number, digits = 0) =>
  `${(ratio * 100).toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;

/** +7,5 pp / −0,2 pp */
export const points = (pp: number) => {
  const abs = Math.abs(pp).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${pp < 0 ? "−" : "+"}${abs} pp`;
};

export const count = (n: number) => n.toLocaleString("pt-BR");

/** 2017-12-31 → 31/12/2017 */
export const dateBr = (iso: string) => iso.split("-").reverse().join("/");
