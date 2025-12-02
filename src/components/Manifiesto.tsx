import { Terminal } from "lucide-react";

const principles = [
  { id: "01", text: "La estrategia se prueba en la operación diaria, no en el PPT." },
  { id: "02", text: "Si una alarma suena y nadie hace nada, es ruido, no señal." },
  { id: "03", text: "La IA solo amplifica el orden; si automatizas caos, escalas problemas." },
  { id: "04", text: "Manuales vivos &gt; Documentación estática archivada." },
  { id: "05", text: "Decisiones trazables: ¿Quién? ¿Cuándo? ¿Por qué?" },
];

export default function Manifiesto() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 md:p-12">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
      
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_1.5fr]">
        
        {/* Header */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-emerald-400">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono font-bold tracking-widest uppercase">System_Core</span>
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">
            Operar es decidir.<br />
            <span className="text-slate-500">Todo el tiempo.</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Eliminamos la ambigüedad para que los equipos puedan ejecutar con confianza. 
            Nuestra cultura se basa en principios innegociables.
          </p>
        </div>

        {/* Principles List */}
        <div className="space-y-4">
          {principles.map(({ id, text }) => (
            <div 
              key={id} 
              className="group flex gap-4 p-4 rounded-lg hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition-all"
            >
              <span className="font-mono text-sm text-emerald-500/50 group-hover:text-emerald-400 pt-1">
                {`[LOG_${id}]`}
              </span>
              <p className="text-slate-300 font-medium group-hover:text-white transition-colors">
                {text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}