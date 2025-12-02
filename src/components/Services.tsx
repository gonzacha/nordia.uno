import { Brain, ClipboardList, Compass, GitBranch, Radar } from "lucide-react";

const services = [
  {
    title: "Diagnóstico situacional",
    description: "Lectura rápida de riesgos operativos, dependencias y cuellos de botella.",
    icon: Radar,
  },
  {
    title: "Arquitectura de procesos",
    description: "Diseño de flujos, responsables y SLAs con indicadores accionables.",
    icon: ClipboardList,
  },
  {
    title: "Automatización e IA",
    description: "Bots, orquestadores y modelos que accionan sobre eventos reales del negocio.",
    icon: Brain,
  },
  {
    title: "Operación asistida",
    description: "Célula externa que monitorea, alerta y ejecuta playbooks junto a tus equipos.",
    icon: Compass,
  },
  {
    title: "Gobierno y continuidad",
    description: "Políticas de acceso, trazabilidad y recuperación ante incidentes.",
    icon: GitBranch,
  },
];

export default function Services() {
  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Servicios</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Desplegamos orden en fases cortas</h2>
        </div>
        <p className="text-sm text-slate-400 sm:max-w-sm">
          Cada servicio se entrega con manuales accionables, tableros y acompañamiento para equipos reales.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="group rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-emerald-500/5 transition hover:-translate-y-1 hover:border-emerald-500/40"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-300">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
