import "../App.css"

export default function Tabs({ activeTab, onChange }) {
  return (
    <section className="tabs-row">
      <button
        className={activeTab === "chart" ? "tab-button is-active" : "tab-button"}
        onClick={() => onChange("chart")}
      >
        Chart
      </button>

      <button
        className={activeTab === "table" ? "tab-button is-active" : "tab-button"}
        onClick={() => onChange("table")}
      >
        Hour by hour
      </button>

      <button
        className={activeTab === "compare" ? "tab-button is-active" : "tab-button"}
        onClick={() => onChange("compare")}
      >
        Model vs AESO
      </button>
    </section>
  )
}