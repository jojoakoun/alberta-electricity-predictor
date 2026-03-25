import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts"
import "../App.css"
import CustomTooltip from "./CustomTooltip"

// 🕐 Convert 24h to AM/PM
function formatHour(hour) {
  const h = hour % 12 || 12
  const ampm = hour < 12 ? "AM" : "PM"
  return `${h}${ampm}`
}

export default function ForecastChart({
  data,
  isToday,
  currentHour,
  withActual,
  getLevel,
  formatMoney,
}) {
  const peakHour = data.length
    ? data.reduce((max, row) =>
        row.prediction > max.prediction ? row : max
      , data[0])
    : null

  const cheapestHour = data.length
    ? data.reduce((min, row) =>
        row.prediction < min.prediction ? row : min
      , data[0])
    : null

  // 📍 Find the data entry matching currentHour for the ReferenceLine
  const currentEntry = data.find(row => row.hour_local === currentHour)

  return (
    <section className="panel">
      <div className="section-head section-head--with-copy">
        <div>
          <p className="eyebrow">Daily guidance</p>
          <h2>When electricity is cheaper or more expensive today</h2>
          <p className="section-copy">
            This chart helps you spot the more expensive hours and the cheaper
            windows during the day. Higher peaks usually mean more expensive
            electricity, while lower parts of the chart are often better for
            flexible usage like laundry, dishwashers, or EV charging.
          </p>

          {peakHour && cheapestHour && (
            <p className="section-copy" style={{ marginTop: "10px" }}>
              The current outlook suggests that electricity may be most
              expensive around{" "}
              <strong>{formatHour(peakHour.hour_local)}</strong> and cheapest
              around <strong>{formatHour(cheapestHour.hour_local)}</strong>.
            </p>
          )}
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="hour_local"
              stroke="#64748b"
              tickFormatter={formatHour}
              fontSize={12}
            />

            <YAxis stroke="#64748b" fontSize={12} unit="$" />

            <Tooltip
              content={
                <CustomTooltip getLevel={getLevel} formatMoney={formatMoney} />
              }
            />

            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />

            <ReferenceLine y={50}  stroke="#eab308" strokeDasharray="4 4" />
            <ReferenceLine y={100} stroke="#f97316" strokeDasharray="4 4" />
            <ReferenceLine y={300} stroke="#dc2626" strokeDasharray="4 4" />

            {/* 📍 "Now" line — uses the actual hour_local value from data */}
            {isToday && currentEntry && (
              <ReferenceLine
                x={currentEntry.hour_local}
                stroke="#0f172a"
                strokeDasharray="6 4"
                label={{
                  value: "Now",
                  position: "top",
                  fill: "#0f172a",
                  fontSize: 11,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="prediction"
              stroke="#2563eb"
              fill="url(#predGrad)"
              strokeWidth={3}
              name="Our predicted price"
            />

            <Area
              type="monotone"
              dataKey="price_forecast"
              stroke="#f59e0b"
              fill="none"
              strokeWidth={2}
              strokeDasharray="6 5"
              name="AESO forecast"
            />

            {withActual.length > 0 && (
              <Area
                type="monotone"
                dataKey="price_actual"
                stroke="#16a34a"
                fill="none"
                strokeWidth={2}
                name="Actual settled price"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
