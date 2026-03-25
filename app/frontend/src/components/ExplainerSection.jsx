import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function ExplainerSection() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <section className="mt-5 grid gap-4 md:grid-cols-3">
      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-[14px] bg-slate-100 text-[22px]">
          ⚙️
        </span>
        <h3 className="mb-2 text-[1.05rem] font-extrabold text-slate-900">
          {t.explainer.whatMeans}
        </h3>
        <p className="text-[0.94rem] leading-7 text-slate-500">
          {t.explainer.whatMeansBody}
        </p>
      </article>

      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-[14px] bg-slate-100 text-[22px]">
          📈
        </span>
        <h3 className="mb-2 text-[1.05rem] font-extrabold text-slate-900">
          {t.explainer.whyChanges}
        </h3>
        <p className="text-[0.94rem] leading-7 text-slate-500">
          {t.explainer.whyChangesBody}
        </p>
      </article>

      <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <span className="mb-3 inline-grid h-11 w-11 place-items-center rounded-[14px] bg-slate-100 text-[22px]">
          🏠
        </span>
        <h3 className="mb-2 text-[1.05rem] font-extrabold text-slate-900">
          {t.explainer.howHelps}
        </h3>
        <p className="text-[0.94rem] leading-7 text-slate-500">
          {t.explainer.howHelpsBody}
        </p>
      </article>
    </section>
  )
}