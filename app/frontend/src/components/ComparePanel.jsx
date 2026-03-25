import {
  formatMoney,
  formatShortDate,
  formatDateTimeLabel,
} from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function ComparePanel({
  withActual,
  ourMAE,
  aesoMAE,
  selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  const readableDate = formatShortDate(selectedDate, language)
  const hasComparison = ourMAE != null && aesoMAE != null
  const ourModelIsBetter = hasComparison ? ourMAE <= aesoMAE : false

  return (
    <section className="mt-[18px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] md:p-6">

      {/* ── Header ── */}
      <div className="mb-5">
        <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
          {t.compare.eyebrow}
        </p>
        <h2
          className="m-0 text-[1.32rem] leading-tight text-slate-900"
          style={{ fontFamily: "var(--font-primary)" }}
        >
          {t.compare.title} {readableDate}
        </h2>
        <p className="mt-3 max-w-3xl text-[0.94rem] leading-7 text-slate-500">
          {t.compare.subtitle}
        </p>
        {withActual.length > 0 && hasComparison && (
          <p className="mt-2 max-w-3xl text-[0.94rem] leading-7 text-slate-500">
            {ourModelIsBetter ? t.compare.oursCloser : t.compare.aesoCloser}
          </p>
        )}
      </div>

      {/* ── Empty state ── */}
      {withActual.length === 0 ? (
        <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="mb-2 font-semibold text-slate-900">
            {t.common.noFinalPricesYet}
          </p>
          <p className="text-slate-500">{t.common.checkAgainLater}</p>
        </div>
      ) : (
        <>
          {/* ── Summary pills ── */}
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-[0.82rem] font-semibold text-slate-500">
                {t.compare.ourAverageDifference}
              </p>
              <p className="mt-1 text-[1.08rem] font-extrabold text-slate-900">
                {formatMoney(ourMAE)} $/MWh
              </p>
            </div>

            <div className="rounded-[18px] border border-orange-200 bg-orange-50 px-4 py-3">
              <p className="text-[0.82rem] font-semibold text-slate-500">
                {t.compare.aesoAverageDifference}
              </p>
              <p className="mt-1 text-[1.08rem] font-extrabold text-slate-900">
                {formatMoney(aesoMAE)} $/MWh
              </p>
            </div>

            <div
              className={
                ourModelIsBetter
                  ? "rounded-[18px] border border-green-200 bg-green-50 px-4 py-3"
                  : "rounded-[18px] border border-orange-200 bg-orange-50 px-4 py-3"
              }
            >
              <p className="text-[0.82rem] font-semibold text-slate-500">
                {t.compare.overallResult}
              </p>
              <p
                className={
                  ourModelIsBetter
                    ? "mt-1 text-[1.08rem] font-extrabold text-green-800"
                    : "mt-1 text-[1.08rem] font-extrabold text-orange-800"
                }
              >
                {ourModelIsBetter
                  ? t.compare.ourCloser
                  : t.compare.aesoCloserShort}
              </p>
            </div>
          </div>

          {/* ── Per-hour rows ── */}
          <div className="grid gap-3">
            {withActual.map((row) => {
              const ourError  = Math.abs(row.prediction - row.price_actual)
              const aesoError = Math.abs(row.price_forecast - row.price_actual)
              const ourWin    = ourError <= aesoError

              return (
                <div
                  key={row.hour_local}
                  className="grid gap-3 rounded-[18px] border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] md:grid-cols-[200px_minmax(120px,1fr)_140px_140px] md:items-center"
                >
                  {/* Hour */}
                  <div>
                    <p className="whitespace-nowrap text-[0.95rem] font-semibold text-slate-900">
                      {formatDateTimeLabel(selectedDate, row.hour_local, language)}
                    </p>
                  </div>

                  {/* Final price */}
                  <div className="md:text-center md:pr-4">
                    <p className="text-[0.74rem] font-semibold uppercase tracking-[0.05em] text-slate-500">
                      {t.common.finalPrice}
                    </p>
                    <p className="mt-0.5 text-[1rem] font-extrabold text-slate-900">
                      {formatMoney(row.price_actual)} $/MWh
                    </p>
                  </div>

                  {/* Our error */}
                  <div
                    className={
                      ourWin
                        ? "rounded-[14px] border border-green-200 bg-green-50 px-3 py-2.5"
                        : "rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5"
                    }
                  >
                    <p className="text-[0.75rem] font-semibold text-slate-500">
                      {t.common.ourForecast}
                    </p>
                    <p
                      className={
                        ourWin
                          ? "mt-0.5 text-[0.98rem] font-extrabold text-green-800"
                          : "mt-0.5 text-[0.98rem] font-extrabold text-slate-800"
                      }
                    >
                      {t.compare.offBy} {formatMoney(ourError, 1)}
                    </p>
                  </div>

                  {/* AESO error */}
                  <div
                    className={
                      !ourWin
                        ? "rounded-[14px] border border-green-200 bg-green-50 px-3 py-2.5"
                        : "rounded-[14px] border border-slate-200 bg-slate-50 px-3 py-2.5"
                    }
                  >
                    <p className="text-[0.75rem] font-semibold text-slate-500">
                      {t.common.aesoForecast}
                    </p>
                    <p
                      className={
                        !ourWin
                          ? "mt-0.5 text-[0.98rem] font-extrabold text-green-800"
                          : "mt-0.5 text-[0.98rem] font-extrabold text-slate-800"
                      }
                    >
                      {t.compare.offBy} {formatMoney(aesoError, 1)}
                    </p>
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