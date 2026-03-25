import "../App.css"

export default function TrustBanner({
  benchmarkOurMae,
  benchmarkAesoMae,
  onToggleExplainer,
  showExplainer,
  formatMoney,
}) {
  return (
    <section className="trust-banner">
      <div className="trust-copy">
        <p className="eyebrow">Confidence check</p>
        <h2>How reliable the forecast looks</h2>
        <p>
          When final market prices are available, our model shows an average
          error of{" "}
          <strong>
            {benchmarkOurMae != null
              ? `${formatMoney(benchmarkOurMae)} $/MWh`
              : "not available yet"}
          </strong>{" "}
          compared with{" "}
          <strong>
            {benchmarkAesoMae != null
              ? `${formatMoney(benchmarkAesoMae)} $/MWh`
              : "not available yet"}
          </strong>{" "}
          for the AESO forecast.
        </p>
      </div>

      <div className="trust-actions">
        <button className="secondary-button" onClick={onToggleExplainer}>
          {showExplainer ? "Hide simple explanation" : "How to read this"}
        </button>
      </div>
    </section>
  )
}