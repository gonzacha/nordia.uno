const principles = [
  "La estrategia se prueba en operación diaria, no en presentaciones.",
  "Cada alarma necesita un dueño y un tiempo de respuesta claro.",
  "La IA es útil cuando reduce fricción y aumenta trazabilidad.",
  "Los equipos operan mejor con manuales vivos y decisiones trazables.",
  "Preferimos ciclos cortos, entregables concretos y medición continua.",
];

export default function Manifiesto() {
  return (
    <section className="mx-auto max-w-6xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Manifiesto Nordia</p>
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/40 p-6 shadow-xl shadow-emerald-500/10">
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">Operar es decidir todo el tiempo</h2>
            <p className="text-base text-slate-300 sm:text-lg">
              Nuestro trabajo es que cada decisión tenga contexto, métricas y protocolo. Eliminamos ruido para que
              founders, gerencias y equipos de campo reaccionen con claridad ante cambios o incidentes.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-slate-950/60 p-5">
            <ul className="space-y-3 text-sm text-slate-200">
              {principles.map((principle) => (
                <li key={principle} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
