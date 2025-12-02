import Link from "next/link";
import { ArrowUpRight, FolderOpen } from "lucide-react";

const projects = [
  {
    title: "Nordia POS",
    description: "Sistema de facturación con validación de stock y caja en tiempo real.",
    href: "/nordia-pos",
    status: "live",
    label: "En Producción",
  },
  {
    title: "Simulador de Escenarios",
    description: "Playground financiero para proyectar impacto de inflación y costos.",
    href: "/simulacion",
    status: "demo",
    label: "Demo Interactiva",
  },
  {
    title: "SGIC - Field Ops",
    description: "Gestión de técnicos de campo con geolocalización y reporte offline.",
    href: "/demo",
    status: "dev",
    label: "En Desarrollo",
  },
];

export default function Portfolio() {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-3">
        <FolderOpen className="h-6 w-6 text-emerald-500" />
        <h2 className="text-2xl font-bold text-white">Portfolio &amp; Casos</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map(({ title, description, href, status, label }) => {
          
          const statusColors = {
            live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            demo: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            dev: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          };

          const colorClass = statusColors[status as keyof typeof statusColors];

          return (
            <Link
              key={href}
              href={href}
              className="group flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-600 transition-all hover:bg-slate-850 p-6 overflow-hidden relative"
            >
              <div className="flex items-start justify-between mb-4">
                <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-1 rounded border ${colorClass}`}>
                  {label}
                </span>
                <ArrowUpRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              
              <div className="mt-auto">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:underline decoration-emerald-500 decoration-2 underline-offset-4">
                  {title}
                </h3>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}