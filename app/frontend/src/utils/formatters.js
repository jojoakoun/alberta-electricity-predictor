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
  const suffix = normalizedHour >= 12 ? "p.m." : "a.m."
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

// 🎯 Use timestamp_utc to get real Edmonton date and time
export function formatDateTimeLabel(dateString, hour, language = "en", timestampUtc = null) {
  // ✅ If we have the real UTC timestamp, use it for Edmonton local date
  if (timestampUtc) {
    const edmontonDate = new Date(timestampUtc).toLocaleDateString(
      language === "fr" ? "fr-CA" : "en-CA",
      {
        timeZone: "America/Edmonton",
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    )
    const formattedHour = formatHourLabel(hour, language)
    return language === "fr"
      ? `${edmontonDate} à ${formattedHour}`
      : `${edmontonDate} at ${formattedHour}`
  }

  // 📅 Fallback — use dateString
  const formattedDate = formatShortDate(dateString, language)
  const formattedHour = formatHourLabel(hour, language)
  return language === "fr"
    ? `${formattedDate} à ${formattedHour}`
    : `${formattedDate} at ${formattedHour}`
}