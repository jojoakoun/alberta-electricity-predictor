import "../App.css"

// 🕐 Convert 24h to AM/PM
function formatHour(hour) {
  const h = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  return `${h}:00 ${ampm}`
}

export default function CustomTooltip({ active, payload, getLevel, formatMoney }) {
  if (!active || !payload?.length) return null

  const row   = payload[0].payload
  const level = getLevel(row.prediction)

  // 💬 Human advice per level — full appliance list
  const summaries = {
    spike:
      "⚠️ Very expensive: avoid dryer, oven, water heater, EV charging, and space heaters right now.",
    high:
      "🟠 Pricier than usual: delay dryer, dishwasher, laundry, and EV charging if possible.",
    moderate:
      "🟡 Manageable: fine for normal use. Avoid running dryer or oven if a cheaper hour is coming.",
    normal:
      "🟢 Good time: run your dryer, dishwasher, laundry, oven, and charge your EV now.",
  }
  const humanSummary = summaries[level.key] ?? summaries.normal

  return (
    <div className="tooltip-card" style={{ maxWidth: 230, fontSize: 12 }}>

      {/* ── Time ── */}
      <div className="tooltip-topline">
        {formatHour(row.hour_local)} Alberta time
      </div>

      {/* ── Badge ── */}
      <div
        className="tooltip-badge"
        style={{ color: level.color, background: level.bg, borderColor: level.border }}
      >
        {level.light} {level.label}
      </div>

      {/* ── Prices ── */}
      <div className="tooltip-grid">
        <div>
          <span>Our prediction</span>
          <strong>{formatMoney(row.prediction)} $/MWh</strong>
        </div>
        <div>
          <span>AESO forecast</span>
          <strong>{formatMoney(row.price_forecast)} $/MWh</strong>
        </div>
        {row.price_actual != null ? (
          <div>
            <span>Actual price</span>
            <strong>{formatMoney(row.price_actual)} $/MWh</strong>
          </div>
        ) : (
          <div>
            <span>Actual price</span>
            <strong style={{ color: "#9ca3af" }}>Not published yet</strong>
          </div>
        )}
      </div>

      {/* ── Human advice ── */}
      <p className="tooltip-note" style={{
        background: level.bg, borderRadius: 6,
        padding: "6px 8px", marginTop: 8,
        color: level.color, fontWeight: 500,
        fontSize: 11,
      }}>
        {humanSummary}
      </p>

    </div>
  )
}
