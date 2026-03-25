export function getLevel(price) {
  if (price >= 300) {
    return {
      key: "spike",
      light: "🔴",
      label: "Spike",
      color: "#dc2626",
      bg: "#fff1f2",
      border: "#fecdd3",
      accentSoft: "rgba(220, 38, 38, 0.10)",
      advice:
        "Avoid dryer, oven, electric water heater, EV charging, and space heaters right now.",
      saving:
        "Waiting just 2-3 hours could save you $5-15 on a typical load.",
    }
  }
 
  if (price >= 100) {
    return {
      key: "high",
      light: "🟠",
      label: "High",
      color: "#ea580c",
      bg: "#fff7ed",
      border: "#fed7aa",
      accentSoft: "rgba(234, 88, 12, 0.10)",
      advice:
        "Delay your dryer, dishwasher, laundry, oven, or EV charging to a cheaper hour.",
      saving:
        "Shifting a dryer load from this hour to off-peak can save $3-8.",
    }
  }
 
  if (price >= 50) {
    return {
      key: "moderate",
      light: "🟡",
      label: "Moderate",
      color: "#ca8a04",
      bg: "#fefce8",
      border: "#fde68a",
      accentSoft: "rgba(202, 138, 4, 0.10)",
      advice:
        "Fine for normal use — avoid running dryer, oven, or water heater if a cheaper window is coming.",
      saving:
        "A small timing shift on heavy loads like the dryer could still save $1-3.",
    }
  }
 
  return {
    key: "normal",
    light: "🟢",
    label: "Normal",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    accentSoft: "rgba(22, 163, 74, 0.10)",
    advice:
      "Great time — run your dryer, dishwasher, laundry, oven, and charge your EV now.",
    saving:
      "Prices are low — take advantage now for all your heavy electricity needs.",
  }
}
 
export function getBestWindow(data, hours = 3) {
  if (!data.length || data.length < hours) {
    return null
  }
 
  let best = null
 
  for (let index = 0; index <= data.length - hours; index += 1) {
    const window = data.slice(index, index + hours)
    const avg = window.reduce((sum, item) => sum + item.prediction, 0) / hours
 
    if (!best || avg < best.avg) {
      best = {
        start: window[0].hour_local,
        end: window[window.length - 1].hour_local,
        avg,
      }
    }
  }
 
  return best
}
 
export function getPotentialSaving(currentPrice, cheapestPrice, kwh = 10) {
  if (currentPrice == null || cheapestPrice == null) {
    return null
  }
 
  const dollars = ((currentPrice - cheapestPrice) * kwh) / 1000
  return Math.max(0, dollars)
}
 