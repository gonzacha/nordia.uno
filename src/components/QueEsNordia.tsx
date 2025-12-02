export default function QueEsNordia() {
  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">¿Qué es Nordia?</p>
      <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-6 shadow-xl shadow-emerald-500/10">
        <div className="grid gap-6 md:grid-cols-3 md:gap-10">
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Consultora de inteligencia situacional aplicada</h2>
            <p className="text-base text-slate-300 sm:text-lg">
              Aterrizamos estrategia en operación diaria. Diseñamos y operamos sistemas que combinan procesos, datos y
              tecnología para que cada área del negocio sepa qué hacer, cuándo y con qué nivel de riesgo.
            </p>
            <p className="text-base text-slate-300 sm:text-lg">
              Trabajamos con PyMEs que necesitan control sin burocracia: equipos comerciales, operaciones, logística,
              cobranzas y atención al cliente.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100">
            <p className="font-semibold text-emerald-200">Entregables clave</p>
            <ul className="space-y-2 text-emerald-50/90">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Mapas de procesos y roles con indicadores accionables.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                Dashboards de situación y protocolos de respuesta.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                Automatizaciones con IA y monitoreo continuo.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
