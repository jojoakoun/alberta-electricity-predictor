import "../App.css"

export default function ComparePanel({
  withActual,
  ourMAE,
  aesoMAE,
  formatMoney,
}) {
  const ourModelIsBetter =
    ourMAE != null && aesoMAE != null ? ourMAE <= aesoMAE : false

  const improvementPct =
    ourMAE != null && aesoMAE != null && aesoMAE > 0
      ? ((aesoMAE - ourMAE) / aesoMAE) * 100
      : null

  return (
    <section className="panel">
      <div className="section-head section-head--with-copy">
        <div>
          <p className="eyebrow">Model check</p>
          <h2>How our model compares with the AESO forecast</h2>
          <p className="section-copy">
            This section looks only at hours where the final market price is
            already known. It shows whether our model or the AESO forecast was
            closer to what actually happened.
          </p>

          {withActual.length > 0 && ourMAE != null && aesoMAE != null && (
            <p className="section-copy" style={{ marginTop: "10px" }}>
              {ourModelIsBetter ? (
                <>
                  On these completed hours, our model was generally{" "}
                  <strong>closer to the real price</strong> than the AESO
                  forecast.
                  {improvementPct != null && (
                    <>
                      {" "}
                      That is about <strong>{formatMoney(improvementPct)}%</strong>{" "}
                      better on average.
                    </>
                  )}
                </>
              ) : (
                <>
                  On these completed hours, the <strong>AESO forecast</strong>{" "}
                  was generally closer to the real price than our model.
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {withActual.length === 0 ? (
        <div className="empty-card">
          <p>No final market prices are available yet for this selection.</p>
          <span>
            Come back later once the actual hourly prices have been published.
          </span>
        </div>
      ) : (
        <>
          <div className="compare-summary">
            <div className="compare-pill compare-pill--ours">
              <span>Our average error</span>
              <strong>{formatMoney(ourMAE)} $/MWh</strong>
            </div>

            <div className="compare-pill compare-pill--aeso">
              <span>AESO average error</span>
              <strong>{formatMoney(aesoMAE)} $/MWh</strong>
            </div>

            <div
              className={
                ourModelIsBetter
                  ? "compare-outcome compare-outcome--win"
                  : "compare-outcome compare-outcome--loss"
              }
            >
              {ourModelIsBetter
                ? "Our model was more accurate on this completed set."
                : "AESO was more accurate on this completed set."}
            </div>
          </div>

          <div className="compare-list">
            {withActual.map((row) => {
              const ourError = Math.abs(row.prediction - row.price_actual)
              const aesoError = Math.abs(row.price_forecast - row.price_actual)
              const ourWin = ourError <= aesoError

              return (
                <div key={row.hour_local} className="compare-row">
                  <div className="compare-hour">{row.hour_local}:00</div>

                  <div className="compare-actual">
                    Final price{" "}
                    <strong>{formatMoney(row.price_actual)} $/MWh</strong>
                  </div>

                  <div
                    className={
                      ourWin
                        ? "compare-score compare-score--winner"
                        : "compare-score"
                    }
                  >
                    Our model missed by {formatMoney(ourError, 1)}
                  </div>

                  <div
                    className={
                      !ourWin
                        ? "compare-score compare-score--winner"
                        : "compare-score"
                    }
                  >
                    AESO missed by {formatMoney(aesoError, 1)}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}