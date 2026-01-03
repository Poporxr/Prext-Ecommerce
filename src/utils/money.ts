export function formatMoney({priceCents} : {priceCents: number}): string {
  return `$${(priceCents / 100).toFixed(2)}`;
}

