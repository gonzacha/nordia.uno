import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Nordia POS",
    description: "Suite de pagos y facturación con flujos operativos controlados.",
    href: "/nordia-pos",
    badge: "Producto en vivo",
  },
  {
    title: "Simulación",
    description: "Modelos de escenarios operativos y financieros en tiempo real.",
    href: "/simulacion",
    badge: "Playground",
  },
  {
    title: "Demo completa",
    description: "Recorrido de punta a punta con casos reales de operación.",
    href: "/simulacion/demo-completa",
    badge: "Demo guiada",
  },
  {
    title: "SGIC",
    description: "Sistema de Gestión Integral de Clientes orientado a equipos de campo.",
    href: "/demo",
    badge: "SGIC",
  },
  {
    title: "Yaguareté",
    description: "Implementación en curso con foco en continuidad y trazabilidad.",
    href: "/yaguarete",
    badge: "En desarrollo",
  },
];

export default function Portfolio() {
  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Portfolio</p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Casos y rutas disponibles</h2>
        </div>
        <p className="text-sm text-slate-400 sm:max-w-sm">Accedé a demos y productos que operamos hoy.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(({ title, description, href, badge }) => (
          <Link
            key={href}
            href={href}
            className="group flex h-full flex-col justify-between rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-emerald-500/5 transition hover:-translate-y-1 hover:border-emerald-500/40"
          >
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {badge}
              </span>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-300">{description}</p>
            </div>
            <div className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-300">
              Ir al caso
              <ArrowUpRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
