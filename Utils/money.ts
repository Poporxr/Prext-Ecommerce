export const formatMoney = ({ priceKobo }: { priceKobo: number }) =>
  `₦${(priceKobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
