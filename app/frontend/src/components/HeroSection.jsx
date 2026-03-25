import "../App.css"

export default function HeroSection({
  isToday,
  selectedDate,
  current,
  level,
  peakHour,
  cheapestHour,
  bestWindow,
  avgPrice,
  benchmarkImprovement,
  potentialSaving,
  formatMoney,
  StatCard,
}) {
  return (
    <section className="hero-grid">
      <article
        className="hero-card hero-card--primary"
        style={{
          background: `linear-gradient(180deg, ${level.bg} 0%, #ffffff 100%)`,
          borderColor: level.border,
        }}
      >
        <div className="hero-kicker-row">
          <span className="hero-kicker">
            {isToday
              ? `Current hour · ${current.hour_local}:00`
              : `Selected date · ${selectedDate}`}
          </span>

          <span
            className="hero-badge"
            style={{
              color: level.color,
              background: level.accentSoft,
            }}
          >
            {level.light} {level.label}
          </span>
        </div>

        <div className="hero-price-row">
          <div>
            <div className="hero-price">
              {formatMoney(current.prediction, 0)}
            </div>
            <div className="hero-unit">$/MWh</div>
          </div>

          <div
            className="hero-side-pill"
            style={{
              color: level.color,
              borderColor: level.border,
              background: "#fff",
            }}
          >
            {peakHour
              ? `Highest risk around ${peakHour.hour_local}:00`
              : "Monitoring the day"}
          </div>
        </div>

        <h2 className="hero-title">{level.advice}</h2>

        <p className="hero-copy">
          {level.saving}
          {potentialSaving != null && potentialSaving > 0
            ? ` If you move a flexible 10 kWh use from now to the cheapest hour, you could save about $${formatMoney(potentialSaving)}.`
            : ""}
        </p>

        <div className="hero-details-grid">
          <div>
            <span>Right now</span>
            <strong>{current.hour_local}:00</strong>
          </div>

          <div>
            <span>Cheapest hour today</span>
            <strong>
              {cheapestHour.hour_local}:00 ·{" "}
              {formatMoney(cheapestHour.prediction)} $/MWh
            </strong>
          </div>

          <div>
            <span>Most expensive hour today</span>
            <strong>
              {peakHour.hour_local}:00 · {formatMoney(peakHour.prediction)} $/MWh
            </strong>
          </div>
        </div>
      </article>

      <aside className="hero-side">
        <StatCard
          label="Best time block today"
          value={
            bestWindow
              ? `${bestWindow.start}:00 → ${bestWindow.end}:00`
              : "—"
          }
          helper={
            bestWindow
              ? `This is the cheapest 3-hour window based on the current forecast, with an average of ${formatMoney(bestWindow.avg)} $/MWh.`
              : "There is not enough data yet to identify a lower-cost time block."
          }
          tone="blue"
        />

        <StatCard
          label="Typical price for today"
          value={avgPrice != null ? `${formatMoney(avgPrice)} $/MWh` : "—"}
          helper="Use this as a simple reference point to see whether a given hour looks cheaper or more expensive than the rest of the day."
          tone="default"
        />

        <StatCard
          label="Model advantage so far"
          value={
            benchmarkImprovement != null
              ? `${formatMoney(benchmarkImprovement)}%`
              : "—"
          }
          helper="This shows how much better our model has performed compared with the AESO forecast when final market prices are available."
          tone={
            benchmarkImprovement != null && benchmarkImprovement >= 0
              ? "green"
              : "orange"
          }
        />
      </aside>
    </section>
  )
}