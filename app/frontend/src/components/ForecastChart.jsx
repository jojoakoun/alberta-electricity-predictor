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
import CustomTooltip from "./CustomTooltip"
import { formatShortDate, formatHourLabel } from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function ForecastChart({
  data,
  isToday,
  currentHour,
  withActual,
  getLevel,
  formatMoney,
  selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  const readableDate = formatShortDate(selectedDate, language)

  const chartData = data.map((row, index) => ({
    ...row,
    chart_index: index,
  }))

  const peakHour = chartData.length
    ? chartData.reduce(
        (max, row) => (row.prediction > max.prediction ? row : max),
        chartData[0],
      )
    : null

  const cheapestHour = chartData.length
    ? chartData.reduce(
        (min, row) => (row.prediction < min.prediction ? row : min),
        chartData[0],
      )
    : null

  const currentIndex = isToday
    ? chartData.findIndex((row) => row.hour_local === currentHour)
    : -1

  return (
    <section className="mt-[18px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">
      <div className="mb-5">
        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
          {t.chart.eyebrow}
        </p>

        <h2
          className="m-0 text-[1.32rem] leading-tight text-slate-900"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          {t.chart.title} {readableDate}
        </h2>

        <p className="mt-3 max-w-3xl text-[0.94rem] leading-7 text-slate-500">
          {t.chart.subtitle}
        </p>

        {(peakHour || cheapestHour) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {cheapestHour && (
              <div className="rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-[0.84rem] font-medium text-green-800">
                {t.common.lowestAround}{" "}
                <strong>{formatHourLabel(cheapestHour.hour_local, language)}</strong>
              </div>
            )}

            {peakHour && (
              <div className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[0.84rem] font-medium text-orange-800">
                {t.common.highestAround}{" "}
                <strong>{formatHourLabel(peakHour.hour_local, language)}</strong>
              </div>
            )}

            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[0.84rem] font-medium text-slate-600">
              {t.common.extendsNextMorning}
            </div>
          </div>
        )}
      </div>

      <div className="h-[320px] w-full md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="chart_index"
              stroke="#64748b"
              interval={0}
              fontSize={12}
              tickFormatter={(value) => {
                const row = chartData[value]
                if (!row) return ""
                return value % 2 === 0
                  ? formatHourLabel(row.hour_local, language)
                  : ""
              }}
            />

            <YAxis stroke="#64748b" fontSize={12} unit="$" />

            <Tooltip
              content={
                <CustomTooltip
                  getLevel={getLevel}
                  formatMoney={formatMoney}
                  selectedDate={selectedDate}
                />
              }
            />

            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 18 }} />

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
              strokeWidth={3}
              name={t.common.ourForecast}
            />

            <Area
              type="monotone"
              dataKey="price_forecast"
              stroke="#f59e0b"
              fill="none"
              strokeWidth={2}
              strokeDasharray="6 5"
              name={t.common.aesoForecast}
            />

            {withActual.length > 0 && (
              <Area
                type="monotone"
                dataKey="price_actual"
                stroke="#16a34a"
                fill="none"
                strokeWidth={2}
                name={t.common.finalPrice}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}