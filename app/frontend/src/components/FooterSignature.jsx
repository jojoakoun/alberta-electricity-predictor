import { useLanguage } from "../context/LanguageContext"

export default function FooterSignature() {
  const { language } = useLanguage()
  const isFrench = language === "fr"

  return (
    <footer className="mt-8 rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 px-5 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.08)] md:px-7 md:py-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <img
              src="/joel-akoun.jpeg"
              alt="Joel Akoun"
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
            />
            <span className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white bg-blue-600 text-xs text-white shadow-sm">
              ✦
            </span>
          </div>

          <div className="max-w-2xl">
            <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.14em] text-blue-600">
              {isFrench ? "Conçu par" : "Built by"}
            </p>

            <h3
              className="text-[1.2rem] leading-tight text-slate-900 sm:text-[1.3rem]"
              style={{ fontFamily: "var(--font-primary)" }}
            >
              Joel Akoun
            </h3>

            <p className="mt-2 text-[0.95rem] leading-7 text-slate-600">
              {isFrench
                ? "Conçu et développé pour aider les utilisateurs à mieux comprendre les prix de l’électricité en Alberta, heure par heure."
                : "Designed and developed to help people better understand Alberta electricity prices, hour by hour."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <a
            href="https://www.linkedin.com/in/joelakoun/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-px hover:border-blue-200 hover:bg-blue-50"
          >
            {isFrench ? "Voir mon LinkedIn" : "View my LinkedIn"}
          </a>
        </div>
      </div>
    </footer>
  )
}