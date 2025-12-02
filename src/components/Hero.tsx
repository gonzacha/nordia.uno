import { ArrowRight, LineChart, ShieldCheck, Workflow } from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    label: "Procesos",
    text: "Arquitectura Operativa",
    icon: Workflow,
  },
  {
    label: "Tecnología",
    text: "IA & Automatización",
    icon: LineChart,
  },
  {
    label: "Control",
    text: "Gobierno & Riesgo",
    icon: ShieldCheck,
  },
];

export default function Hero() {
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-32 lg:pb-40 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm mb-8 animate-fade-in opacity-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">
            Sistemas Operativos para PyMEs
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-fade-up opacity-0 [animation-delay:100ms]">
          Inteligencia Situacional <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
            Aplicada al Negocio
          </span>
        </h1>

        {/* Subtext */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed animate-fade-up opacity-0 [animation-delay:200ms]">
          Transformamos el caos operativo en sistemas predecibles. <br className="hidden sm:block" />
          Combinamos procesos, datos y automatización para que tu empresa funcione con la precisión de un reloj.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up opacity-0 [animation-delay:300ms]">
          <Link
            href="https://wa.me/5493794815782"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-base transition-all hover:bg-emerald-400 hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
          >
            Hablar con un consultor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <div className="text-sm text-slate-500 font-medium">
            Respuesta &lt; 24hs
          </div>
        </div>

        {/* Highlights Strip */}
        <div className="mt-20 pt-10 border-t border-slate-800/50 flex flex-wrap justify-center gap-8 sm:gap-16 animate-fade-up opacity-0 [animation-delay:400ms]">
          {highlights.map(({ label, text, icon: Icon }) => (
            <div key={text} className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-sm font-medium text-slate-200">{text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}