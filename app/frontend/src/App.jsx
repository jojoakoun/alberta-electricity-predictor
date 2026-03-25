import { useState, useEffect } from "react"
import axios from "axios"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from "recharts"

const API_URL = "http://127.0.0.1:8000"

function getPriceColor(price) {
  if (price >= 300) return "#dc2626"
  if (price >= 100) return "#ea580c"
  return "#16a34a"
}

function getPriceLabel(price) {
  if (price >= 300) return "⚠️ Spike — Avoid heavy appliances"
  if (price >= 100) return "🟠 Elevated — Use with caution"
  return "🟢 Normal — Good time to use electricity"
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
      <p style={{ fontSize: 28, fontWeight: 700, color: color || "#111827" }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{unit}</span>
      </p>
      {subtitle && <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>{subtitle}</p>}
    </div>
  )
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: "#fff", border: "1px solid #e5e7eb",
      borderRadius: 8, padding: "10px 14px", fontSize: 13,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      <p style={{ color: "#6b7280", marginBottom: 6, fontWeight: 600 }}>
        {d.hour_local}:00 Alberta time
      </p>
      <p style={{ color: "#3b82f6" }}>
        Our prediction : <strong>{d.prediction} $/MWh</strong>
      </p>
      <p style={{ color: "#f59e0b" }}>
        AESO forecast : <strong>{d.price_forecast} $/MWh</strong>
      </p>
      {d.price_actual !== null && (
        <p style={{ color: "#16a34a" }}>
          Actual : <strong>{d.price_actual} $/MWh</strong>
        </p>
      )}
    </div>
  )
}

export default function App() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [health, setHealth]   = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [latestRes, healthRes] = await Promise.all([
          axios.get(`${API_URL}/latest`),
          axios.get(`${API_URL}/health`),
        ])
        setData(latestRes.data.predictions)
        setHealth(healthRes.data)
      } catch {
        setError("Cannot connect to API — make sure the backend is running.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentHour = new Date().getHours()
  const current     = data.find(d => d.hour_local === currentHour)
  const maxSpike    = data.reduce(
    (max, d) => d.prediction > max.prediction ? d : max,
    { prediction: 0, hour_local: 0 }
  )
  const avgPrice = data.length
    ? (data.reduce((s, d) => s + d.prediction, 0) / data.length).toFixed(1)
    : null

  return (
    <div style={{
      minHeight: "100vh", background: "#f9fafb",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e5e7eb",
        padding: "16px 32px", display: "flex",
        alignItems: "center", gap: 12
      }}>
        <span style={{ fontSize: 24 }}>⚡</span>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
            Alberta Electricity Predictor
          </h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Hourly price predictions — beats AESO by 30.4%
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>

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
          <p style={{ color: "#6b7280", textAlign: "center" }}>
            Loading predictions...
          </p>
        )}

        {/* ── Stat cards ── */}
        {current && (
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard
              title="Right now"
              value={current.prediction}
              unit="$/MWh"
              subtitle={getPriceLabel(current.prediction)}
              color={getPriceColor(current.prediction)}
            />
            <StatCard
              title="Peak hour today"
              value={`${maxSpike.hour_local}:00`}
              unit=""
              subtitle={`${maxSpike.prediction} $/MWh expected`}
              color="#f59e0b"
            />
            <StatCard
              title="24h average"
              value={avgPrice}
              unit="$/MWh"
              subtitle="Our model prediction"
              color="#3b82f6"
            />
            {health && (
              <StatCard
                title="Model accuracy"
                value={`+30.4%`}
                unit=""
                subtitle={`MAE ${health.mae_overall} $/MWh vs AESO ${health.mae_spikes}`}
                color="#8b5cf6"
              />
            )}
          </div>
        )}

        {/* ── Tip banner ── */}
        {maxSpike.prediction >= 100 && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: 8, padding: "12px 16px",
            marginBottom: 24, color: "#92400e", fontSize: 14
          }}>
            💡 <strong>Tip :</strong> Highest price expected at{" "}
            <strong>{maxSpike.hour_local}:00</strong> ({maxSpike.prediction} $/MWh).
            Run your dishwasher, laundry, and EV charging before or after.
          </div>
        )}

        {/* ── Chart ── */}
        {data.length > 0 && (
          <div style={{
            background: "#fff", borderRadius: 12, padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{
              fontSize: 16, fontWeight: 600,
              color: "#111827", marginBottom: 20
            }}>
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
                <XAxis
                  dataKey="hour_local"
                  stroke="#9ca3af"
                  tickFormatter={h => `${h}h`}
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" unit="$" fontSize={12}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend
                  wrapperStyle={{ fontSize: 13, paddingTop: 16 }}
                />
                <ReferenceLine
                  y={300} stroke="#dc2626"
                  strokeDasharray="4 4"
                  label={{ value: "Spike", fill: "#dc2626", fontSize: 11 }}
                />
                <ReferenceLine
                  y={100} stroke="#ea580c"
                  strokeDasharray="4 4"
                  label={{ value: "Elevated", fill: "#ea580c", fontSize: 11 }}
                />
                <Area
                  type="monotone" dataKey="prediction"
                  stroke="#3b82f6" fill="url(#predGrad)"
                  name="Our prediction" strokeWidth={2.5}
                />
                <Area
                  type="monotone" dataKey="price_forecast"
                  stroke="#f59e0b" fill="none"
                  name="AESO forecast" strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Footer ── */}
        <p style={{
          textAlign: "center", color: "#9ca3af",
          fontSize: 12, marginTop: 32
        }}>
          Data from AESO · Model trained on 2020–2024 · Updated hourly
        </p>
      </div>
    </div>
  )
}