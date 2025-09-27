import { BusinessMetric, BusinessAction } from "@/lib/api";

interface Props {
  metrics: BusinessMetric[];
  actions: BusinessAction[];
}

export const BusinessKPI = ({ metrics, actions }: Props) => {
  const formatValue = (value: number, format: BusinessMetric["format"]) => {
    switch (format) {
      case "currency":
        return `$${value.toLocaleString("es-AR")}`;
      case "percentage":
        return `${value}%`;
      case "hours":
        return `${value}h`;
      case "number":
        return value.toLocaleString("es-AR");
      default:
        return value.toString();
    }
  };

  const getTrendColor = (trend: BusinessMetric["trend"]) => {
    switch (trend) {
      case "positive":
        return "text-green-400 border-green-500/30 bg-green-500/10";
      case "negative":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      case "urgent":
        return "text-orange-400 border-orange-500/30 bg-orange-500/10";
      default:
        return "text-slate-400 border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <section className="space-y-8 relative" style={{
      backgroundImage: "url('/isp-network-bg.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed"
    }}>
      {/* Header con indicador de datos REALES */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💼</span>
            <div>
              <h3 className="text-emerald-400 font-semibold">Dashboard de Negocio</h3>
              <p className="text-emerald-300 text-sm">Métricas que importan para tu ISP • Datos CSV reales</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-mono text-sm">ROI en 3 días</p>
            <p className="text-emerald-300 text-xs">Sistema se paga solo</p>
          </div>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <article
            key={metric.id}
            className={`group relative overflow-hidden rounded-2xl border p-6 shadow-lg shadow-slate-950/40 transition-all hover:scale-105 ${getTrendColor(metric.trend)}`}
            title={metric.tooltip}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition group-hover:opacity-100" />
            
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{metric.icon}</span>
                {metric.actionable && (
                  <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                    Accionable
                  </span>
                )}
              </div>
              
              <div>
                <p className="text-xs uppercase tracking-widest opacity-80">
                  {metric.title}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {formatValue(metric.value, metric.format)}
                </p>
                {metric.action_text && (
                  <p className="text-sm mt-2 font-medium opacity-90">
                    {metric.action_text}
                  </p>
                )}
              </div>
            </div>

            {/* Tooltip en hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-64 z-20">
              <p>{metric.tooltip}</p>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </article>
        ))}
      </div>

      {/* Sección de acciones inmediatas */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>⚡</span>
          Acciones inmediatas
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                action.urgent 
                  ? "border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20" 
                  : "border-slate-600/50 bg-slate-800/50 hover:bg-slate-800/80"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{action.icon}</span>
                  <h4 className={`font-semibold ${action.urgent ? "text-orange-400" : "text-white"}`}>
                    {action.title}
                  </h4>
                </div>
                {action.urgent && (
                  <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                    URGENTE
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-300 mb-3">{action.description}</p>
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">⏱️ {action.estimated_time}</span>
                <span className={`font-semibold ${action.urgent ? "text-orange-400" : "text-emerald-400"}`}>
                  +${action.potential_recovery.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};