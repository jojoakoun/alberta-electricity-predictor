import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function Tabs({ activeTab, onChange }) {
  const { language } = useLanguage()
  const t = translations[language]

  const activeClass =
    "flex-1 rounded-full bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition sm:flex-none sm:px-4"
  const inactiveClass =
    "flex-1 rounded-full px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:-translate-y-px sm:flex-none sm:px-4"

  return (
    <section className="mt-5 flex w-full gap-1 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:inline-flex sm:w-auto sm:gap-2">
      <button
        className={activeTab === "chart" ? activeClass : inactiveClass}
        onClick={() => onChange("chart")}
      >
        {t.tabs.chart}
      </button>

      <button
        className={activeTab === "table" ? activeClass : inactiveClass}
        onClick={() => onChange("table")}
      >
        {t.tabs.table}
      </button>

      <button
        className={activeTab === "compare" ? activeClass : inactiveClass}
        onClick={() => onChange("compare")}
      >
        {t.tabs.compare}
      </button>
    </section>
  )
}