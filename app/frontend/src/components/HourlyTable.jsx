import "../App.css"

export default function HourlyTable({
  data,
  isToday,
  currentHour,
  getLevel,
  formatMoney,
}) {
  return (
    <section className="panel">
      <div className="section-head section-head--with-copy">
        <div>
          <p className="eyebrow">Hourly guidance</p>
          <h2>Hour-by-hour electricity outlook</h2>
          <p className="section-copy">
            Use this table to compare each hour and quickly see when electricity
            looks more affordable or more expensive. The recommendation column
            translates the forecast into a simple action for normal household use.
          </p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="hour-table">
          <thead>
            <tr>
              <th>Hour</th>
              <th>Price level</th>
              <th>Our predicted price</th>
              <th>AESO forecast</th>
              <th>Final price</th>
              <th>What this means</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const rowLevel = getLevel(row.prediction)
              const isCurrentRow = isToday && row.hour_local === currentHour

              return (
                <tr
                  key={row.hour_local}
                  className={isCurrentRow ? "is-current" : ""}
                >
                  <td>{row.hour_local}:00</td>

                  <td>
                    <span
                      className="status-chip"
                      style={{
                        color: rowLevel.color,
                        background: rowLevel.bg,
                        borderColor: rowLevel.border,
                      }}
                    >
                      {rowLevel.light} {rowLevel.label}
                    </span>
                  </td>

                  <td>{formatMoney(row.prediction)} $/MWh</td>
                  <td>{formatMoney(row.price_forecast)} $/MWh</td>
                  <td>
                    {row.price_actual != null
                      ? `${formatMoney(row.price_actual)} $/MWh`
                      : "Not published yet"}
                  </td>
                  <td>{rowLevel.advice}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}