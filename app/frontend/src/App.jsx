import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from "recharts"

const API_URL = "http://127.0.0.1:8000"

function getPriceColor(price) {
  if (price >= 300) return "#dc2626"
  if (price >= 100) return "#ea580c"
  if (price >= 50)  return "#f59e0b"
  return "#16a34a"
}

function getPriceBg(price) {
  if (price >= 300) return "#fef2f2"
  if (price >= 100) return "#fff7ed"
  if (price >= 50)  return "#fffbeb"
  return "#f0fdf4"
}

function getRiskLabel(price) {
  if (price >= 300) return "🔴 Spike"
  if (price >= 100) return "🟠 High"
  if (price >= 50)  return "🟡 Medium"
  return "🟢 Low"
}

function getPriceAdvice(price) {
  if (price >= 300) return "Avoid all non-essential electricity use"
  if (price >= 100) return "Delay heavy appliances if possible"
  if (price >= 50)  return "Moderate use — consider shifting to later"
  return "Great time to run dishwasher, laundry, EV charging"
}

function StatCard({ title, value, unit, subtitle, color }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      borderTop: `3px solid ${color || "#3b82f6"}`,
      flex: 1, minWidth: 160,
    }}>
      <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: color || "#111827", margin: 0 }}>
        {value}
        <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4, color: "#6b7280" }}>
          {unit}
        </span>
      </p>
      {subtitle && (
        <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 6, margin: 0 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 10, padding: "12px 16px", fontSize: 13,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
    }}>
      <p style={{ color: "#374151", fontWeight: 600, marginBottom: 8 }}>
        {d.hour_local}:00 Alberta time
      </p>
      <div style={{
        display: "inline-block", background: getPriceBg(d.prediction),
        color: getPriceColor(d.prediction), borderRadius: 6,
        padding: "2px 8px", fontSize: 12, fontWeight: 600, marginBottom: 8
      }}>
        {getRiskLabel(d.prediction)}
      </div>
      <p style={{ color: "#3b82f6", margin: "4px 0" }}>
        Our prediction : <strong>{d.prediction} $/MWh</strong>
      </p>
      <p style={{ color: "#f59e0b", margin: "4px 0" }}>
        AESO forecast : <strong>{d.price_forecast} $/MWh</strong>
      </p>
      {d.price_actual !== null && d.price_actual !== undefined && (
        <p style={{ color: "#16a34a", margin: "4px 0" }}>
          Actual : <strong>{d.price_actual} $/MWh</strong>
        </p>
      )}
      <p style={{ color: "#6b7280", fontSize: 11, marginTop: 8, borderTop: "1px solid #f3f4f6", paddingTop: 6 }}>
        {getPriceAdvice(d.prediction)}
      </p>
    </div>
  )
}

function HourRow({ row, isCurrent }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 16px", borderRadius: 8,
      background: isCurrent ? "#eff6ff" : "transparent",
      border: isCurrent ? "1px solid #bfdbfe" : "1px solid transparent",
      marginBottom: 4,
    }}>
      <span style={{
        width: 48, color: isCurrent ? "#2563eb" : "#374151",
        fontWeight: isCurrent ? 700 : 400, fontSize: 14
      }}>
        {row.hour_local}:00
      </span>
      <span style={{
        display: "inline-block", width: 80,
        background: getPriceBg(row.prediction),
        color: getPriceColor(row.prediction),
        borderRadius: 6, padding: "2px 8px",
        fontSize: 12, fontWeight: 600, textAlign: "center"
      }}>
        {getRiskLabel(row.prediction)}
      </span>
      <span style={{ flex: 1, color: "#111827", fontWeight: 600, fontSize: 14 }}>
        {row.prediction} $/MWh
      </span>
      <span style={{ color: "#9ca3af", fontSize: 12 }}>
        AESO : {row.price_forecast}$
      </span>
      {row.price_actual !== null && row.price_actual !== undefined && (
        <span style={{ color: "#16a34a", fontSize: 12 }}>
          Actual : {row.price_actual}$
        </span>
      )}
      {isCurrent && (
        <span style={{
          background: "#2563eb", color: "#fff",
          borderRadius: 6, padding: "2px 8px", fontSize: 11
        }}>
          NOW
        </span>
      )}
    </div>
  )
}

export default function App() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [health, setHealth]     = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [activeTab, setActiveTab] = useState("chart")

  const fetchData = useCallback(async (date) => {
    try {
      setError(null)
      const isToday = date === new Date().toISOString().split("T")[0]
      const [dataRes, healthRes] = await Promise.all([
        isToday
          ? axios.get(`${API_URL}/latest`)
          : axios.get(`${API_URL}/predict?date=${date}`),
        axios.get(`${API_URL}/health`),
      ])
      const predictions = isToday
        ? dataRes.data.predictions
        : dataRes.data.predictions
      setData(predictions)
      setHealth(healthRes.data)
      setLastUpdate(new Date().toLocaleTimeString("en-CA"))
    } catch {
      setError("Cannot connect to API — make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }, [])

  // 🔄 Initial load
  useEffect(() => {
    fetchData(selectedDate)
  }, [selectedDate, fetchData])

  // 🔄 Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(selectedDate)
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [selectedDate, fetchData])

  const currentHour = new Date().getHours()
  const current     = data.find(d => d.hour_local === currentHour)
  const maxSpike    = data.reduce(
    (max, d) => d.prediction > max.prediction ? d : max,
    { prediction: 0, hour_local: 0 }
  )
  const avgPrice = data.length
    ? (data.reduce((s, d) => s + d.prediction, 0) / data.length).toFixed(1)
    : null
  const spikeHours = data.filter(d => d.prediction >= 300).length
  const isToday = selectedDate === new Date().toISOString().split("T")[0]

  // 📊 Model accuracy on hours with actual prices
  const withActual = data.filter(d => d.price_actual !== null && d.price_actual !== undefined)
  const ourMAE  = withActual.length
    ? (withActual.reduce((s, d) => s + Math.abs(d.prediction - d.price_actual), 0) / withActual.length).toFixed(2)
    : null
  const asoMAE = withActual.length
    ? (withActual.reduce((s, d) => s + Math.abs(d.price_forecast - d.price_actual), 0) / withActual.length).toFixed(2)
    : null

  const tabStyle = (tab) => ({
    padding: "8px 20px", borderRadius: 8, cursor: "pointer",
    fontWeight: 500, fontSize: 14, border: "none",
    background: activeTab === tab ? "#2563eb" : "transparent",
    color: activeTab === tab ? "#fff" : "#6b7280",
  })

  return (
    <div style={{
      minHeight: "100vh", background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "14px 32px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>⚡</span>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
              Alberta Electricity Predictor
            </h1>
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Hourly predictions for Alberta families · beats AESO by 30.4%
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdate && (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              Updated {lastUpdate} · auto-refresh 5min
            </span>
          )}
          <input
            type="date"
            value={selectedDate}
            onChange={e => { setSelectedDate(e.target.value); setLoading(true) }}
            style={{
              border: "1px solid #e5e7eb", borderRadius: 8,
              padding: "6px 12px", fontSize: 13, color: "#374151",
              outline: "none", cursor: "pointer"
            }}
          />
          <button
            onClick={() => fetchData(selectedDate)}
            style={{
              background: "#2563eb", color: "#fff",
              border: "none", borderRadius: 8, padding: "7px 14px",
              fontSize: 13, cursor: "pointer", fontWeight: 500
            }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 16px" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: 8, padding: 16, marginBottom: 24, color: "#dc2626"
          }}>
            ❌ {error}
          </div>
        )}

        {loading && (
          <p style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>
            Loading predictions...
          </p>
        )}

        {/* ── Stat cards ── */}
        {!loading && current && (
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard
              title={isToday ? "Right now" : "Average price"}
              value={isToday ? current.prediction : avgPrice}
              unit="$/MWh"
              subtitle={isToday ? getPriceAdvice(current.prediction) : `${data.length} hours`}
              color={getPriceColor(isToday ? current.prediction : parseFloat(avgPrice))}
            />
            <StatCard
              title="Peak hour"
              value={`${maxSpike.hour_local}:00`}
              unit=""
              subtitle={`${maxSpike.prediction} $/MWh expected`}
              color="#f59e0b"
            />
            <StatCard
              title="24h average"
              value={avgPrice}
              unit="$/MWh"
              subtitle={`${spikeHours} spike hours (>300$)`}
              color="#3b82f6"
            />
            {ourMAE && asoMAE && (
              <StatCard
                title="Our accuracy today"
                value={`${ourMAE}$`}
                unit="MAE"
                subtitle={`AESO : ${asoMAE}$ MAE on same hours`}
                color={parseFloat(ourMAE) < parseFloat(asoMAE) ? "#16a34a" : "#dc2626"}
              />
            )}
          </div>
        )}

        {/* ── Tip banner ── */}
        {!loading && maxSpike.prediction >= 50 && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: 8, padding: "12px 16px",
            marginBottom: 24, color: "#92400e", fontSize: 14
          }}>
            💡 <strong>Tip :</strong> Peak price expected at{" "}
            <strong>{maxSpike.hour_local}:00</strong> ({maxSpike.prediction} $/MWh).{" "}
            {getPriceAdvice(maxSpike.prediction)}.
          </div>
        )}

        {/* ── Tabs ── */}
        {!loading && data.length > 0 && (
          <>
            <div style={{
              display: "flex", gap: 4, marginBottom: 16,
              background: "#f1f5f9", borderRadius: 10, padding: 4,
              width: "fit-content"
            }}>
              <button style={tabStyle("chart")} onClick={() => setActiveTab("chart")}>
                📈 Chart
              </button>
              <button style={tabStyle("table")} onClick={() => setActiveTab("table")}>
                📋 Hour by hour
              </button>
              <button style={tabStyle("compare")} onClick={() => setActiveTab("compare")}>
                🏆 Our model vs AESO
              </button>
            </div>

            {/* ── Chart tab ── */}
            {activeTab === "chart" && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
                  24-hour price forecast
                </h2>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
                    <XAxis dataKey="hour_local" stroke="#9ca3af"
                      tickFormatter={h => `${h}h`} fontSize={12}/>
                    <YAxis stroke="#9ca3af" unit="$" fontSize={12}/>
                    <Tooltip content={<CustomTooltip/>}/>
                    <Legend wrapperStyle={{ fontSize: 13, paddingTop: 16 }}/>
                    <ReferenceLine y={300} stroke="#dc2626" strokeDasharray="4 4"
                      label={{ value: "Spike", fill: "#dc2626", fontSize: 11 }}/>
                    <ReferenceLine y={100} stroke="#ea580c" strokeDasharray="4 4"
                      label={{ value: "Elevated", fill: "#ea580c", fontSize: 11 }}/>
                    <Area type="monotone" dataKey="prediction"
                      stroke="#3b82f6" fill="url(#predGrad)"
                      name="Our prediction" strokeWidth={2.5}/>
                    <Area type="monotone" dataKey="price_forecast"
                      stroke="#f59e0b" fill="none"
                      name="AESO forecast" strokeWidth={1.5} strokeDasharray="5 5"/>
                    {withActual.length > 0 && (
                      <Area type="monotone" dataKey="price_actual"
                        stroke="#16a34a" fill="none"
                        name="Actual price" strokeWidth={1.5}/>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Table tab ── */}
            {activeTab === "table" && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 16 }}>
                  Hour by hour breakdown
                </h2>
                {data.map(row => (
                  <HourRow
                    key={row.hour_local}
                    row={row}
                    isCurrent={isToday && row.hour_local === currentHour}
                  />
                ))}
              </div>
            )}

            {/* ── Compare tab ── */}
            {activeTab === "compare" && (
              <div style={{
                background: "#fff", borderRadius: 12, padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
              }}>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
                  Our model vs AESO — who was more accurate ?
                </h2>

                {withActual.length === 0 ? (
                  <p style={{ color: "#6b7280" }}>
                    No actual prices available yet for comparison.
                    Check back later when the day's prices are settled.
                  </p>
                ) : (
                  <>
                    {/* ── Winner banner ── */}
                    <div style={{
                      background: parseFloat(ourMAE) < parseFloat(asoMAE)
                        ? "#f0fdf4" : "#fef2f2",
                      border: `1px solid ${parseFloat(ourMAE) < parseFloat(asoMAE)
                        ? "#bbf7d0" : "#fecaca"}`,
                      borderRadius: 8, padding: "12px 16px", marginBottom: 20,
                      color: parseFloat(ourMAE) < parseFloat(asoMAE)
                        ? "#15803d" : "#dc2626",
                      fontWeight: 600, fontSize: 14
                    }}>
                      {parseFloat(ourMAE) < parseFloat(asoMAE)
                        ? `🏆 Our model wins — ${ourMAE}$ MAE vs AESO ${asoMAE}$ MAE`
                        : `📊 AESO wins today — ${asoMAE}$ MAE vs our ${ourMAE}$ MAE`}
                    </div>

                    {/* ── Per-hour comparison ── */}
                    {data.filter(d => d.price_actual !== null && d.price_actual !== undefined).map(row => {
                      const errOurs = Math.abs(row.prediction - row.price_actual).toFixed(1)
                      const errAeso = Math.abs(row.price_forecast - row.price_actual).toFixed(1)
                      const weWin   = parseFloat(errOurs) <= parseFloat(errAeso)
                      return (
                        <div key={row.hour_local} style={{
                          display: "flex", alignItems: "center",
                          gap: 12, padding: "8px 12px", borderRadius: 8,
                          marginBottom: 4,
                          background: weWin ? "#f0fdf4" : "#fef2f2"
                        }}>
                          <span style={{ width: 48, fontWeight: 600, fontSize: 13 }}>
                            {row.hour_local}:00
                          </span>
                          <span style={{ color: "#6b7280", fontSize: 12, flex: 1 }}>
                            Actual : <strong style={{ color: "#111827" }}>{row.price_actual}$</strong>
                          </span>
                          <span style={{
                            color: weWin ? "#15803d" : "#6b7280", fontSize: 12
                          }}>
                            Ours : {errOurs}$ error {weWin ? "✅" : ""}
                          </span>
                          <span style={{
                            color: !weWin ? "#15803d" : "#6b7280", fontSize: 12
                          }}>
                            AESO : {errAeso}$ error {!weWin ? "✅" : ""}
                          </span>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* ── Footer ── */}
        <p style={{
          textAlign: "center", color: "#9ca3af",
          fontSize: 12, marginTop: 32
        }}>
          Data from AESO · Hybrid XGBoost model trained on 2020–2024 ·
          MAE {health?.mae_overall}$/MWh overall · Auto-refresh every 5 minutes
        </p>
      </div>
    </div>
  )
}