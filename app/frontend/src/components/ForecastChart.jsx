import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend,
} from "recharts"
import CustomTooltip from "./CustomTooltip"
import { formatShortDate, formatHourLabel } from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function ForecastChart({
  data, isToday, currentHour, withActual,
  getLevel, formatMoney, selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]
  const readableDate = formatShortDate(selectedDate, language)

  const chartData = data.map((row, index) => ({ ...row, chart_index: index }))

  const peakHour = chartData.length
    ? chartData.reduce((max, row) => row.prediction > max.prediction ? row : max, chartData[0])
    : null

  const cheapestHour = chartData.length
    ? chartData.reduce((min, row) => row.prediction < min.prediction ? row : min, chartData[0])
    : null

  const currentIndex = isToday
    ? chartData.findIndex((row) => row.hour_local === currentHour)
    : -1

  // 📊 Show fewer ticks on mobile — every 4th hour
  const tickInterval = Math.floor(chartData.length / 6)

  return (
    <section className="mt-[18px] rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">

      {/* ── Header ── */}
      <div className="mb-4">
        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
          {t.chart.eyebrow}
        </p>
        <h2
          className="m-0 text-[1.2rem] leading-tight text-slate-900 sm:text-[1.32rem]"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          {t.chart.title} {readableDate}
        </h2>
        <p className="mt-2 max-w-3xl text-[0.9rem] leading-6 text-slate-500">
          {t.chart.subtitle}
        </p>

        {/* Peak / cheapest pills */}
        {(peakHour || cheapestHour) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cheapestHour && (
              <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[0.82rem] font-medium text-green-800">
                {t.common.lowestAround}{" "}
                <strong>{formatHourLabel(cheapestHour.hour_local, language)}</strong>
              </div>
            )}
            {peakHour && (
              <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[0.82rem] font-medium text-orange-800">
                {t.common.highestAround}{" "}
                <strong>{formatHourLabel(peakHour.hour_local, language)}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="h-[260px] w-full sm:h-[320px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="chart_index"
              stroke="#94a3b8"
              fontSize={10}
              interval={tickInterval}
              tickFormatter={(value) => {
                const row = chartData[value]
                if (!row) return ""
                return formatHourLabel(row.hour_local, language)
              }}
            />

            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              unit="$"
              width={42}
            />

            <Tooltip
              content={
                <CustomTooltip
                  getLevel={getLevel}
                  formatMoney={formatMoney}
                  selectedDate={selectedDate}
                />
              }
            />

            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
              iconSize={10}
            />

            {isToday && currentIndex >= 0 && (
              <ReferenceLine
                x={currentIndex}
                stroke="#0f172a"
                strokeDasharray="6 4"
              />
            )}

            <Area
              type="monotone"
              dataKey="prediction"
              stroke="#2563eb"
              fill="url(#predGrad)"
              strokeWidth={2}
              name={t.common.ourForecast}
              dot={false}
            />

            <Area
              type="monotone"
              dataKey="price_forecast"
              stroke="#f59e0b"
              fill="none"
              strokeWidth={1.5}
              strokeDasharray="6 5"
              name={t.common.aesoForecast}
              dot={false}
            />

            {withActual.length > 0 && (
              <Area
                type="monotone"
                dataKey="price_actual"
                stroke="#16a34a"
                fill="none"
                strokeWidth={1.5}
                name={t.common.finalPrice}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}