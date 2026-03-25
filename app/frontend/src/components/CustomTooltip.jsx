import { formatMoney, formatDateTimeLabel } from "../utils/formatters"
import { useLanguage } from "../context/LanguageContext"
import { translations } from "../i18n/translations"

export default function CustomTooltip({
  active,
  payload,
  getLevel,
  selectedDate,
}) {
  const { language } = useLanguage()
  const t = translations[language]

  if (!active || !payload?.length) return null

  const row = payload[0].payload
  const level = getLevel(row.prediction)

  let humanSummary =
    language === "fr"
      ? "Cette heure semble assez typique par rapport au reste de la journée."
      : "This hour looks fairly typical compared with the rest of the day."

  if (level.key === "spike") {
    humanSummary =
      language === "fr"
        ? "Cette heure semble faire partie des plus coûteuses de la journée. Il vaut généralement mieux éviter les usages électriques lourds à ce moment."
        : "This looks like one of the most expensive hours of the day. It is usually better to avoid optional heavy electricity use at this time."
  } else if (level.key === "high") {
    humanSummary =
      language === "fr"
        ? "Cette heure semble coûteuse. Attendre un meilleur moment pourrait aider à réduire le coût."
        : "This hour looks expensive. Waiting for a better time could help reduce cost."
  } else if (level.key === "moderate") {
    humanSummary =
      language === "fr"
        ? "Cette heure semble raisonnable, mais il pourrait encore y avoir un moment moins cher plus tard."
        : "This hour looks manageable, but there may still be a cheaper time later."
  } else if (level.key === "normal") {
    humanSummary =
      language === "fr"
        ? "Cela semble être l’un des moments les plus favorables pour un usage flexible de l’électricité à la maison."
        : "This looks like one of the easier times for flexible household electricity use."
  }

  return (
    <div className="w-[220px] max-w-[220px] rounded-[14px] border border-slate-200 bg-white/95 p-3 shadow-[0_12px_24px_rgba(15,23,42,0.14)] backdrop-blur">
      <div className="mb-2 text-[0.76rem] leading-5 text-slate-500">
        {formatDateTimeLabel(selectedDate, row.hour_local, language)}
      </div>

      <div
        className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[0.76rem] font-extrabold"
        style={{
          color: level.color,
          background: level.bg,
          borderColor: level.border,
        }}
      >
        {level.light} {level.label}
      </div>

      <div className="grid gap-2">
        <div>
          <span className="mb-0.5 block text-[0.72rem] text-slate-500">
            {t.common.ourForecast}
          </span>
          <strong className="text-[0.84rem] leading-5 text-slate-900">
            {formatMoney(row.prediction)} $/MWh
          </strong>
        </div>

        <div>
          <span className="mb-0.5 block text-[0.72rem] text-slate-500">
            {t.common.aesoForecast}
          </span>
          <strong className="text-[0.84rem] leading-5 text-slate-900">
            {formatMoney(row.price_forecast)} $/MWh
          </strong>
        </div>

        <div>
          <span className="mb-0.5 block text-[0.72rem] text-slate-500">
            {t.common.finalPrice}
          </span>
          <strong className="text-[0.84rem] leading-5 text-slate-900">
            {row.price_actual != null
              ? `${formatMoney(row.price_actual)} $/MWh`
              : t.common.notPublished}
          </strong>
        </div>
      </div>

      <p className="mt-2 text-[0.75rem] leading-5 text-slate-500">
        {humanSummary}
      </p>
    </div>
  )
}