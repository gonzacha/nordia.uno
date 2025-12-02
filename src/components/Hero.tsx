import { ArrowRight, LineChart, MessageSquare, ShieldCheck, Workflow } from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    title: "Arquitectura operativa",
    description: "Mapeamos procesos críticos y diseñamos flujos que escalan sin perder control.",
    icon: Workflow,
  },
  {
    title: "IA aplicada al negocio",
    description: "Automatizamos decisiones y alertas con datos reales, no promesas abstractas.",
    icon: LineChart,
  },
  {
    title: "Gobierno y seguridad",
    description: "Modelos de acceso, trazabilidad y continuidad para equipos distribuidos.",
    icon: ShieldCheck,
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950" />
      <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute right-0 -bottom-10 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-12 py-20 sm:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-200">
              Inteligencia Situacional Aplicada
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </p>
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Nordia — Inteligencia Situacional Aplicada
              </h1>
              <p className="text-xl text-slate-200 sm:text-2xl">
                Construimos orden y sistemas para PyMEs reales.
              </p>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Combinamos procesos, tecnología e IA para resolver problemas concretos de negocio. Operaciones
                que se miden, alertan y reaccionan en tiempo real.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="https://wa.me/5493794815782"
                className="group inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:bg-emerald-400"
              >
                Hablemos
                <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MessageSquare className="h-4 w-4 text-emerald-300" />
                Respuesta en menos de 1 día hábil.
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur lg:grid-cols-3">
              {highlights.map(({ title, description, icon: Icon }) => (
                <div key={title} className="rounded-xl bg-slate-900/60 p-4 shadow-inner shadow-emerald-500/5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10 backdrop-blur lg:max-w-xl">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-300">Cómo trabajamos</p>
              <div className="space-y-3 text-sm text-slate-200">
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  Diagnóstico situacional con datos de negocio y riesgos operativos.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                  Diseño de procesos, tableros y protocolos de activación.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                  Integraciones y automatización con IA aplicada donde agrega valor.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-200" />
                  Entrenamiento a equipos, manuales y gobierno de cambios.
                </p>
              </div>
              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100">
                Actuamos como célula externa de operaciones para founders y gerencias que necesitan orden,
                trazabilidad y velocidad al mismo tiempo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
