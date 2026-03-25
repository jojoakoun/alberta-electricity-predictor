import { formatMoney, formatShortDate } from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function TrustBanner({
  benchmarkOurMae,
  benchmarkAesoMae,
  onToggleExplainer,
  showExplainer,
  selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  const readableDate = formatShortDate(selectedDate, language)

  const hasBenchmarks =
    benchmarkOurMae != null && benchmarkAesoMae != null

  const ourForecastIsBetter =
    hasBenchmarks ? benchmarkOurMae <= benchmarkAesoMae : false

  const summaryText = hasBenchmarks
    ? ourForecastIsBetter
      ? t.trust.oursBetter
      : t.trust.aesoBetter
    : t.trust.noBenchmarks

  return (
    <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
            {t.trust.eyebrow}
          </p>

          <h2
            className="m-0 text-[1.32rem] leading-tight text-slate-900"
            style={{ fontFamily: "var(--font-primary)" }}
          >
            {t.trust.title}
          </h2>

          <p className="mt-3 text-[0.94rem] leading-7 text-slate-500">
            {t.trust.summaryPrefix} <strong>{readableDate}</strong>.
          </p>

          <p className="mt-2 text-[0.94rem] leading-7 text-slate-500">
            {summaryText}
          </p>

          {hasBenchmarks && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[0.92rem] text-slate-700">
              <span className="font-semibold text-slate-500">
                {t.trust.avgDiffFromFinal}
              </span>
              <span className="font-extrabold text-slate-900">
                {t.common.ours} {formatMoney(benchmarkOurMae)} $/MWh
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-extrabold text-slate-900">
                AESO {formatMoney(benchmarkAesoMae)} $/MWh
              </span>
            </div>
          )}
        </div>

        <button
          className="self-start rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
          onClick={onToggleExplainer}
        >
          {showExplainer ? t.common.hideExplanation : t.common.howToRead}
        </button>
      </div>
    </section>
  )
}