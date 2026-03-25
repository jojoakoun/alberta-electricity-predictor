import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function Header({
  lastUpdate,
  selectedDate,
  onDateChange,
  onRefresh,
}) {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  const isFrench = language === "fr"

  return (
    <header className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-3 pt-7 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] sm:h-14 sm:w-14 sm:text-[28px]">
          ⚡
        </div>

        <div className="max-w-3xl">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-blue-600">
            {isFrench
              ? "Guide de l’électricité en Alberta"
              : "Alberta electricity guide"}
          </p>

          <h1
            className="m-0 max-w-4xl text-[1.75rem] leading-[1.15] tracking-[0.02em] text-slate-900 sm:text-[2.05rem] lg:text-[2.35rem]"
            style={{
              fontFamily: "var(--font-primary)",
              fontWeight: 400,
            }}
          >
            {isFrench
              ? "Prévision du prix de l’électricité en Alberta"
              : t.header.title}
          </h1>

          <p
            className="mt-4 max-w-3xl text-[0.98rem] leading-8 text-slate-500"
            style={{ fontFamily: "var(--font-secondary)" }}
          >
            {isFrench
              ? "Cette application compare notre prévision horaire avec celle de l’AESO, l’Alberta Electric System Operator, pour vous aider à repérer les heures où l’électricité semble moins chère ou plus coûteuse."
              : "This app compares our hourly forecast with the AESO forecast, the Alberta Electric System Operator, to help you spot the hours when electricity looks cheaper or more expensive."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_6px_18px_rgba(15,23,42,0.06)]">
          <button
            type="button"
            aria-label="English"
            title="English"
            className={
              language === "en"
                ? "inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-[1.05rem] text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition"
                : "inline-flex h-10 w-10 items-center justify-center rounded-full text-[1.05rem] text-slate-500 transition hover:bg-slate-50"
            }
            onClick={() => setLanguage("en")}
          >
            🇬🇧
          </button>

          <button
            type="button"
            aria-label="Français"
            title="Français"
            className={
              language === "fr"
                ? "inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-[1.05rem] text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition"
                : "inline-flex h-10 w-10 items-center justify-center rounded-full text-[1.05rem] text-slate-500 transition hover:bg-slate-50"
            }
            onClick={() => setLanguage("fr")}
          >
            🇫🇷
          </button>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-2.5 text-slate-500 backdrop-blur">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600 shadow-[0_0_0_4px_rgba(22,163,74,0.12)]" />
          {lastUpdate ? `${t.header.updatedAt} ${lastUpdate}` : t.header.waitingForData}
        </div>

        <input
          className="min-w-[165px] rounded-full border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          type="date"
          value={selectedDate}
          onChange={(event) => onDateChange(event.target.value)}
        />

        <button
          className="rounded-full bg-blue-600 px-4 py-3 font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition hover:-translate-y-px hover:bg-blue-700"
          onClick={onRefresh}
        >
          {t.common.refresh}
        </button>
      </div>
    </header>
  )
}