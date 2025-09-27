import { RealDataSummary } from "@/lib/api";

interface Props {
  summary: RealDataSummary;
}

const KPI_LABELS: Record<string, { label: string; suffix?: string; prefix?: string; icon?: string }> = {
  clients_active: { label: "👥 Clientes conectados", icon: "👥" },
  monthly_revenue: { label: "💰 Ingresos del mes", prefix: "$", icon: "💰" },
  manual_hours: { label: "⏰ Horas de trabajo manual", icon: "⏰" },
  operational_cost: { label: "💸 Gastos operativos", prefix: "$", icon: "💸" },
  pending_cuts: { label: "⚠️ Clientes por gestionar", icon: "⚠️" },
  automation_rate: { label: "🚀 Nivel de automatización", suffix: "%", icon: "🚀" },
};

export const KpiDeck = ({ summary }: Props) => {
  return (
    <section className="space-y-6">
      {/* Indicador de datos reales */}
      <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
        <p className="text-green-400 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>Datos REALES de tu archivo CSV</span>
          <span className="font-mono text-xs">({summary.csv_file})</span>
          <span className="text-xs text-green-300">• ${summary.recoverable_today?.toLocaleString() || '0'} recuperables HOY</span>
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(KPI_LABELS).map(([key, meta]) => {
        const value = Number(summary[key]) ?? 0;
        const formatted = formatValue(value, meta);
        return (
          <article
            key={key}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-400">{meta.label}</span>
              <strong className="text-3xl font-semibold text-white">{formatted}</strong>
            </div>
          </article>
        );
      })}
      </div>
    </section>
  );
};

function formatValue(value: number, meta: { prefix?: string; suffix?: string }) {
  if (meta.suffix === "%") {
    return `${Math.round(value * 100)}%`;
  }
  const formatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  });
  const formatted = formatter.format(value);
  return `${meta.prefix ?? ""}${formatted}${meta.suffix ?? ""}`;
}
