import { formatMoney, formatShortDate, formatHourLabel } from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function HeroSection({
  isToday,
  selectedDate,
  current,
  hasRealCurrentHour,
  level,
  peakHour,
  cheapestHour,
  bestWindow,
  avgPrice,
  ourMAE,
  aesoMAE,
  potentialSaving,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  const readableDate = formatShortDate(selectedDate, language)

  const dateForecastSummary =
    ourMAE != null && aesoMAE != null
      ? ourMAE <= aesoMAE
        ? t.hero.dateForecastCloser
        : t.hero.dateAesoCloser
      : t.common.notAvailable

  const dateForecastHelper =
    ourMAE != null && aesoMAE != null
      ? `${t.hero.dateCompareHelperPrefix} ${readableDate}, ${t.hero.dateCompareHelperMiddle} ${formatMoney(ourMAE)} $/MWh ${t.hero.dateCompareHelperAnd} ${formatMoney(aesoMAE)} $/MWh${t.hero.dateCompareHelperSuffix}`
      : language === "fr"
        ? "Il n’y a pas encore assez de prix complétés pour comparer les prévisions de cette date."
        : "There are not enough completed prices yet to compare forecasts for this date."

  const topForecastLabel = hasRealCurrentHour
    ? `${t.hero.forecastFor} ${formatHourLabel(current.hour_local, language)}`
    : `${t.hero.thisViewStartsAt} ${formatHourLabel(current.hour_local, language)}`

  const leftCardLabel = hasRealCurrentHour
    ? t.common.currentHour
    : t.common.startOfView

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.95fr)]">
      <article
        className="rounded-[24px] border bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
        style={{
          background: `linear-gradient(180deg, ${level.bg} 0%, #ffffff 100%)`,
          borderColor: level.border,
        }}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-bold text-slate-500">
            {isToday
              ? `${t.common.today} • ${readableDate}`
              : `${t.common.selectedDate} • ${readableDate}`}
          </span>

          <span
            className="inline-flex items-center rounded-full px-3 py-2 text-sm font-extrabold"
            style={{
              color: level.color,
              background: level.accentSoft,
            }}
          >
            {level.light} {level.label}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-end gap-3">
              <div
                className="leading-none tracking-[-0.04em] text-slate-900"
                style={{
                  fontFamily: "var(--font-primary)",
                  fontSize: "clamp(4rem, 10vw, 6rem)",
                }}
              >
                {formatMoney(current.prediction, 0)}
              </div>

              <div className="pb-3 text-lg font-bold text-slate-500">
                {t.hero.perMwh}
              </div>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-500">
              {topForecastLabel}
            </p>
          </div>

          <div
            className="rounded-full border bg-white/80 px-3.5 py-2 text-sm font-semibold"
            style={{
              color: "#475569",
              borderColor: "#cbd5e1",
            }}
          >
            {t.common.highestPriceAround} {formatHourLabel(peakHour.hour_local, language)}
          </div>
        </div>

        <div className="mb-4 max-w-3xl">
          <h2
            className="text-[1.9rem] leading-tight text-slate-900"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            {level.advice}
          </h2>
        </div>

        <p className="max-w-3xl text-[1rem] leading-8 text-slate-500">
          {potentialSaving != null && potentialSaving > 0
            ? `${t.hero.thisLooksCheaper} $${formatMoney(potentialSaving)} ${t.hero.ifMovedToBestHour}`
            : t.hero.simpleView}
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
            <span className="mb-2 block text-sm text-slate-500">{leftCardLabel}</span>
            <strong
              className="text-lg leading-6 text-slate-900"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {formatHourLabel(current.hour_local, language)}
            </strong>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
            <span className="mb-2 block text-sm text-slate-500">
              {t.hero.cheapestHourToday}
            </span>
            <strong
              className="text-lg leading-6 text-slate-900"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {formatHourLabel(cheapestHour.hour_local, language)}
            </strong>
            <p className="mt-1 text-sm text-slate-500">
              {formatMoney(cheapestHour.prediction)} $/MWh
            </p>
          </div>

          <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4">
            <span className="mb-2 block text-sm text-slate-500">
              {t.hero.mostExpensiveHourToday}
            </span>
            <strong
              className="text-lg leading-6 text-slate-900"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              {formatHourLabel(peakHour.hour_local, language)}
            </strong>
            <p className="mt-1 text-sm text-slate-500">
              {formatMoney(peakHour.prediction)} $/MWh
            </p>
          </div>
        </div>
      </article>

      <aside className="grid gap-4">
        <div className="rounded-[24px] border border-slate-200 bg-gradient-to-b from-blue-50 to-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <p className="mb-2 text-[0.84rem] font-bold leading-5 text-slate-500">
            {t.hero.bestTimeToUse}
          </p>
          <p
            className="mb-2 text-[1.25rem] leading-tight text-slate-900"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            {bestWindow
              ? `${formatHourLabel(bestWindow.start, language)} to ${formatHourLabel(bestWindow.end, language)}`
              : t.common.notAvailable}
          </p>
          <p className="text-[0.88rem] leading-6 text-slate-500">
            {bestWindow ? t.hero.bestWindowHelper : t.hero.notEnoughDataWindow}
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <p className="mb-2 text-[0.84rem] font-bold leading-5 text-slate-500">
            {t.hero.averagePriceToday}
          </p>
          <p
            className="mb-2 text-[1.25rem] leading-tight text-slate-900"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            {avgPrice != null ? `${formatMoney(avgPrice)} $/MWh` : t.common.notAvailable}
          </p>
          <p className="text-[0.88rem] leading-6 text-slate-500">
            {t.hero.avgPriceHelper}
          </p>
        </div>

        <div
          className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${
            ourMAE != null && aesoMAE != null
              ? ourMAE <= aesoMAE
                ? "border-green-200 bg-gradient-to-b from-green-50 to-white"
                : "border-orange-200 bg-gradient-to-b from-orange-50 to-white"
              : "border-slate-200 bg-white"
          }`}
        >
          <p className="mb-2 text-[0.84rem] font-bold leading-5 text-slate-500">
            {t.hero.forecastResultForDate}
          </p>
          <p
            className="mb-2 text-[1.25rem] leading-tight text-slate-900"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            {dateForecastSummary}
          </p>
          <p className="text-[0.88rem] leading-6 text-slate-500">
            {dateForecastHelper}
          </p>
        </div>
      </aside>
    </section>
  )
}