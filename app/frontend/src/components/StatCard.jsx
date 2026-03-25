import "../App.css"

export default function StatCard({ label, value, helper, tone = "default" }) {
  return (
    <div className={`stat-card stat-card--${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-helper">{helper}</p>
    </div>
  )
}