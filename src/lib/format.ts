const currency = new Intl.NumberFormat("ar-IQ", {
  style: "currency",
  currency: "IQD",
  maximumFractionDigits: 2,
});

const dateTime = new Intl.DateTimeFormat("ar-IQ", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number | string | { toString(): string }): string {
  return currency.format(Number(value));
}

export function formatDateTime(value: Date | string): string {
  return dateTime.format(typeof value === "string" ? new Date(value) : value);
}
