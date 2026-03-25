export default function StatCard({ label, value, helper, tone = "default" }) {
  const toneClasses =
    tone === "blue"
      ? "border-slate-200 bg-gradient-to-b from-blue-50 to-white"
      : tone === "green"
      ? "border-green-200 bg-gradient-to-b from-green-50 to-white"
      : tone === "orange"
      ? "border-orange-200 bg-gradient-to-b from-orange-50 to-white"
      : "border-slate-200 bg-white"

  return (
    <div
      className={`rounded-[24px] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${toneClasses}`}
    >
      <p className="mb-2 text-[0.84rem] font-bold leading-5 text-slate-500">
        {label}
      </p>

      <p className="mb-2 text-[1.25rem] font-extrabold leading-tight text-slate-900">
        {value || "Not available"}
      </p>

      <p className="text-[0.88rem] leading-6 text-slate-500">
        {helper}
      </p>
    </div>
  )
}