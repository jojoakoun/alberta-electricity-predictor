import "../App.css"

export default function Header({
  lastUpdate,
  selectedDate,
  onDateChange,
  onRefresh,
}) {
  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-icon">⚡</div>

        <div>
          <p className="eyebrow">Alberta power intelligence</p>
          <h1>Alberta Electricity Predictor</h1>
          <p className="brand-copy">
            A cleaner view of hourly pool price risk, cheap windows, and
            actionable household timing.
          </p>
        </div>
      </div>

      <div className="topbar-actions">
        <div className="last-update">
          <span className="status-dot" />
          {lastUpdate ? `Updated ${lastUpdate}` : "Waiting for data"}
        </div>

        <input
          className="date-input"
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
        />

        <button className="primary-button" onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </header>
  )
}