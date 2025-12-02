import { CheckCircle2 } from "lucide-react";

const deliverables = [
  "Mapas de procesos y roles con métricas claras.",
  "Dashboards de situación en tiempo real.",
  "Automatización de tareas repetitivas (IA).",
  "Protocolos de crisis y respuesta a incidentes.",
];

export default function QueEsNordia() {
  return (
    <section>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Concept */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              ¿Qué es Nordia?
            </h2>
            <div className="h-1 w-20 bg-emerald-500 rounded-full" />
          </div>
          
          <div className="prose prose-lg prose-invert text-slate-300">
            <p>
              Somos una consultora de <strong>ingeniería operativa</strong>. No vendemos diapositivas; 
              construimos la infraestructura invisible que sostiene tu crecimiento.
            </p>
            <p>
              Ayudamos a Founders y Gerentes a recuperar el control de su operación mediante 
              "Inteligencia Situacional": saber exactamente qué está pasando, qué se rompió 
              y quién lo está solucionando, sin tener que preguntar.
            </p>
          </div>
        </div>

        {/* Right Column: Execution Box */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-3xl -z-10" />
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              Lo que entregamos
            </h3>
            
            <ul className="space-y-4">
              {deliverables.map((item, index) => (
                <li key={index} className="flex items-start gap-3 group">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500/50 shrink-0 mt-0.5 transition-colors group-hover:text-emerald-400" />
                  <span className="text-slate-300 text-sm sm:text-base group-hover:text-slate-100 transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-500 italic">
              "Si no está documentado y medido, es solo buena voluntad."
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}