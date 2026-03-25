export function formatMoney(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) {
    return "—"
  }

  return Number(value).toFixed(digits)
}