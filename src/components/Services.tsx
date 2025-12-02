import { Brain, ClipboardList, Compass, GitBranch, Radar } from "lucide-react";

const services = [
  {
    title: "Diagnóstico Radar",
    description: "Identificamos cuellos de botella, riesgos ocultos y dependencias críticas en 2 semanas.",
    icon: Radar,
  },
  {
    title: "Arquitectura de Procesos",
    description: "Diseño de flujos de trabajo, definición de roles (RACI) y establecimiento de SLAs.",
    icon: ClipboardList,
  },
  {
    title: "Automatización & IA",
    description: "Implementación de agentes inteligentes para tareas repetitivas y soporte 24/7.",
    icon: Brain,
  },
  {
    title: "Operación Asistida",
    description: "Acompañamiento en la ejecución diaria. Monitoreamos que los procesos se cumplan.",
    icon: Compass,
  },
  {
    title: "Gobierno de Datos",
    description: "Estandarización de información para que los reportes digan la verdad.",
    icon: GitBranch,
  },
];

export default function Services() {
  return (
    <section className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-emerald-400 font-mono text-xs tracking-wider uppercase mb-2 block">Nuestros Servicios</span>
          <h2 className="text-3xl font-bold text-white">Despliegue Táctico</h2>
        </div>
        <p className="text-slate-400 text-sm max-w-md text-right md:text-right">
          Intervenciones modulares diseñadas para generar impacto medible a corto plazo.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map(({ title, description, icon: Icon }, i) => (
          <div
            key={title}
            className="group relative bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-xl" />
            
            <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 mb-4 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
              <Icon className="h-5 w-5" />
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-200 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}