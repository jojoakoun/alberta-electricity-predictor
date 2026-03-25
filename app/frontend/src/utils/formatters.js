export function formatMoney(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) {
    return "Not available"
  }

  return Number(value).toFixed(digits)
}

export function formatHourLabel(hour, language = "en") {
  if (hour == null || Number.isNaN(Number(hour))) {
    return language === "fr" ? "Heure inconnue" : "Unknown time"
  }

  const normalizedHour = Number(hour)
  const suffix =
    language === "fr"
      ? normalizedHour >= 12
        ? "p.m."
        : "a.m."
      : normalizedHour >= 12
        ? "p.m."
        : "a.m."

  if (normalizedHour === 0) return `12:00 ${suffix}`
  if (normalizedHour < 12) return `${normalizedHour}:00 ${suffix}`
  if (normalizedHour === 12) return `12:00 ${suffix}`

  return `${normalizedHour - 12}:00 ${suffix}`
}

export function formatShortDate(dateString, language = "en") {
  if (!dateString) {
    return language === "fr" ? "Date inconnue" : "Unknown date"
  }

  const date = new Date(`${dateString}T12:00:00`)

  if (Number.isNaN(date.getTime())) {
    return dateString
  }

  return date.toLocaleDateString(language === "fr" ? "fr-CA" : "en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTimeLabel(dateString, hour, language = "en") {
  const formattedDate = formatShortDate(dateString, language)
  const formattedHour = formatHourLabel(hour, language)

  return language === "fr"
    ? `${formattedDate} à ${formattedHour}`
    : `${formattedDate} at ${formattedHour}`
}