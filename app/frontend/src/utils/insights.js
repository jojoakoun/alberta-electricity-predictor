export function getLevel(price, language = "en") {
  const isFrench = language === "fr"

  if (price >= 300) {
    return {
      key: "spike",
      light: "🔴",
      label: isFrench ? "Très élevé" : "Very high",
      color: "#dc2626",
      bg: "#fff1f2",
      border: "#fecdd3",
      accentSoft: "rgba(220, 38, 38, 0.10)",
      advice: isFrench
        ? "Cette heure est très coûteuse. Il vaut mieux éviter les usages électriques lourds non essentiels maintenant."
        : "This is a very expensive hour. It is better to avoid optional heavy electricity use right now.",
      saving: isFrench
        ? "Attendre une meilleure heure pourrait faire une vraie différence sur le coût."
        : "Waiting for a better hour could make a real difference in cost.",
    }
  }

  if (price >= 100) {
    return {
      key: "high",
      light: "🟠",
      label: isFrench ? "Élevé" : "High",
      color: "#ea580c",
      bg: "#fff7ed",
      border: "#fed7aa",
      accentSoft: "rgba(234, 88, 12, 0.10)",
      advice: isFrench
        ? "L’électricité semble coûteuse pendant cette heure. Il peut être préférable d’attendre si votre usage est flexible."
        : "Electricity looks expensive during this hour. It may be better to wait if your use is flexible.",
      saving: isFrench
        ? "Il pourrait y avoir une heure moins chère plus tard dans la journée pour la lessive, le lave-vaisselle ou la recharge d’un véhicule électrique."
        : "There may be a cheaper time later in the day for things like laundry, dishwashing, or EV charging.",
    }
  }

  if (price >= 50) {
    return {
      key: "moderate",
      light: "🟡",
      label: isFrench ? "Modéré" : "Moderate",
      color: "#ca8a04",
      bg: "#fefce8",
      border: "#fde68a",
      accentSoft: "rgba(202, 138, 4, 0.10)",
      advice: isFrench
        ? "Cette heure semble raisonnable pour un usage normal, mais il pourrait encore y avoir un meilleur moment plus tard."
        : "This hour looks manageable for normal use, but there may still be a better time later.",
      saving: isFrench
        ? "Un petit déplacement dans le temps pourrait encore aider à réduire le coût."
        : "A small timing shift could still help lower cost.",
    }
  }

  return {
    key: "normal",
    light: "🟢",
    label: isFrench ? "Plus bas" : "Lower",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    accentSoft: "rgba(22, 163, 74, 0.10)",
    advice: isFrench
      ? "Cela semble être un bon moment pour un usage flexible de l’électricité à la maison."
      : "This looks like a good time for flexible household electricity use.",
    saving: isFrench
      ? "C’est généralement l’un des moments les plus favorables de la journée pour utiliser l’électricité."
      : "This is usually one of the easier times of the day to use electricity.",
  }
}

export function getBestWindow(data, hours = 3) {
  if (!data.length || data.length < hours) {
    return null
  }

  let best = null

  for (let index = 0; index <= data.length - hours; index += 1) {
    const window = data.slice(index, index + hours)
    const avg =
      window.reduce((sum, item) => sum + item.prediction, 0) / hours

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