import {
  formatMoney,
  formatShortDate,
  formatDateTimeLabel,
} from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

function getSimpleAction(levelKey, t) {
  if (levelKey === "spike") return t.table.avoidHeavyUse
  if (levelKey === "high")  return t.table.waitIfPossible
  if (levelKey === "moderate") return t.table.normalUse
  return t.table.goodTime
}

export default function HourlyTable({
  data,
  isToday,
  currentHour,
  getLevel,
  selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  const readableDate = formatShortDate(selectedDate, language)

  const cheapestHour = data.length
    ? data.reduce((min, row) => row.prediction < min.prediction ? row : min, data[0])
    : null

  const peakHour = data.length
    ? data.reduce((max, row) => row.prediction > max.prediction ? row : max, data[0])
    : null

  return (
    <section className="mt-[18px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">

      {/* ── Header ── */}
      <div className="mb-4">
        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
          {t.table.eyebrow}
        </p>
        <h2
          className="m-0 text-[1.32rem] leading-tight text-slate-900"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          {t.table.title}
        </h2>
        <p className="mt-3 max-w-3xl text-[0.94rem] leading-7 text-slate-500">
          {t.table.subtitle} <strong>{readableDate}</strong>
          {t.table.subtitleSuffix}
        </p>
      </div>

      {/* ── Scroll hint on mobile ── */}
      <p className="mb-2 block text-[0.78rem] text-slate-400 sm:hidden">
        ←{" "}
        {language === "fr"
          ? "Faites défiler pour voir tout le tableau"
          : "Scroll to see the full table"}{" "}
        →
      </p>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              {[
                t.common.dateAndTime,
                t.common.level,
                t.common.ourPrice,
                t.common.aesoPrice,
                t.common.finalPrice,
                t.common.action,
              ].map((col) => (
                <th
                  key={col}
                  className="border-b border-slate-200 px-4 pb-3 pt-2 text-left text-[0.76rem] font-bold uppercase tracking-[0.08em] text-slate-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => {
              const rowLevel    = getLevel(row.prediction)
              const isCurrentRow = isToday && row.hour_local === currentHour
              const isBestRow   = cheapestHour && row.hour_local === cheapestHour.hour_local
              const isPeakRow   = peakHour && row.hour_local === peakHour.hour_local

              let rowBackground = ""
              if (isCurrentRow) rowBackground = "bg-blue-50/70"
              else if (isBestRow) rowBackground = "bg-green-50/70"
              else if (isPeakRow) rowBackground = "bg-rose-50/70"

              let rowLabel = ""
              if (isCurrentRow)  rowLabel = t.common.now
              else if (isBestRow) rowLabel = t.common.best
              else if (isPeakRow) rowLabel = t.common.highest

              return (
                <tr
                  key={row.hour_local}
                  className={`${rowBackground} transition-colors hover:bg-slate-50`}
                >
                  {/* Hour */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="whitespace-nowrap text-[0.96rem] font-medium text-slate-900">
                        {formatDateTimeLabel(selectedDate, row.hour_local, language)}
                      </span>
                      {rowLabel && (
                        <span
                          className={`inline-flex self-start rounded-full px-2 py-0.5 text-[0.68rem] font-extrabold ${
                            rowLabel === t.common.now
                              ? "bg-blue-100 text-blue-700"
                              : rowLabel === t.common.best
                                ? "bg-green-100 text-green-700"
                                : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {rowLabel}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Level */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.88rem] font-bold"
                      style={{
                        color: rowLevel.color,
                        background: rowLevel.bg,
                        borderColor: rowLevel.border,
                      }}
                    >
                      {rowLevel.light} {rowLevel.label}
                    </span>
                  </td>

                  {/* Our price */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <span className="text-[0.98rem] font-semibold text-slate-900">
                      {formatMoney(row.prediction)} $/MWh
                    </span>
                  </td>

                  {/* AESO */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <span className="text-[0.98rem] font-medium text-slate-800">
                      {formatMoney(row.price_forecast)} $/MWh
                    </span>
                  </td>

                  {/* Actual */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <span className="text-[0.98rem] font-semibold text-slate-900">
                      {row.price_actual != null
                        ? `${formatMoney(row.price_actual)} $/MWh`
                        : t.common.notPublished}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="border-b border-slate-100 px-4 py-4 align-middle">
                    <span className="text-[0.93rem] font-medium text-slate-600">
                      {getSimpleAction(rowLevel.key, t)}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}