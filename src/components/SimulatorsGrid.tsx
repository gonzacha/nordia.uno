import { simuladores } from "@/data/simuladores";


export default function SimulatorsGrid() {
  return (
    <section className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <header className="space-y-3">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Modo demo · Datos simulados
            </span>
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-900">
              Simuladores Operativos Nordia
            </h1>
          </div>
          <div className="space-y-1">
            <p className="text-sm md:text-base text-slate-700 leading-relaxed">
              MODO DEMO – Escenarios con datos simulados, basados en problemas reales.
            </p>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed">
              DEMO MODE – Simulated data, based on real-world problems.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {simuladores.map((simulador) => (
            <article
              key={simulador.id}
              className="rounded-2xl border border-slate-200 bg-white/70 p-4 md:p-6 flex flex-col gap-4 shadow-sm"
            >
              <span className="inline-flex w-fit items-center rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                Modo demo · Datos simulados
              </span>

              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                  {simulador.nombre}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {simulador.frase_gancho}
                </p>
              </div>

              <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
                <p>
                  {simulador.dolor_que_muestra}
                </p>
                <p>
                  {simulador.promesa_visual}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ideal para
                </p>
                <div className="flex flex-wrap gap-2">
                  {simulador.stakeholders_clave.map((persona) => (
                    <span
                      key={persona}
                      className="rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-700"
                    >
                      {persona}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Métricas clave
                </p>
                <ul className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {simulador.metricas_clave.map((metrica) => (
                    <li
                      key={metrica}
                      className="rounded-lg bg-slate-50 px-2 py-1 leading-relaxed"
                    >
                      • {metrica}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <button className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition-colors">
                  Quiero simular esto en mi negocio
                </button>
                <button className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors">
                  I want to simulate this in my business
                </button>
              </div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
