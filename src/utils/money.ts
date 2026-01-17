export const formatMoney = ({ priceCents }: { priceCents: number }) =>
  `₦${(priceCents / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;