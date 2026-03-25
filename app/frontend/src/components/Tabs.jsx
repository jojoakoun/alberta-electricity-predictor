import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function Tabs({ activeTab, onChange }) {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="mt-5 inline-flex flex-wrap gap-2 rounded-full border border-slate-200 bg-white/90 p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
      <button
        className={
          activeTab === "chart"
            ? "rounded-full bg-blue-600 px-4 py-2.5 font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition"
            : "rounded-full px-4 py-2.5 font-bold text-slate-500 transition hover:-translate-y-px"
        }
        onClick={() => onChange("chart")}
      >
        {t.tabs.chart}
      </button>

      <button
        className={
          activeTab === "table"
            ? "rounded-full bg-blue-600 px-4 py-2.5 font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition"
            : "rounded-full px-4 py-2.5 font-bold text-slate-500 transition hover:-translate-y-px"
        }
        onClick={() => onChange("table")}
      >
        {t.tabs.table}
      </button>

      <button
        className={
          activeTab === "compare"
            ? "rounded-full bg-blue-600 px-4 py-2.5 font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] transition"
            : "rounded-full px-4 py-2.5 font-bold text-slate-500 transition hover:-translate-y-px"
        }
        onClick={() => onChange("compare")}
      >
        {t.tabs.compare}
      </button>
    </section>
  )
}