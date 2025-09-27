interface Job {
  id: string;
  timestamp: string;
  processed: number;
  skipped: number;
  status: string;
}

export const ClientsTable = ({ jobs }: { jobs: Job[] }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">📊 Actividad reciente</h2>
          <p className="text-xs uppercase tracking-widest text-slate-400">Gestiones automáticas realizadas</p>
        </div>
        <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white transition hover:border-white/30 hover:bg-white/10">
          📥 Descargar reporte
        </button>
      </header>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-white/5 text-left text-xs uppercase tracking-[0.2em] text-slate-400">
          <tr>
            <th className="px-6 py-3">🔄 Proceso</th>
            <th className="px-6 py-3">📅 Cuándo</th>
            <th className="px-6 py-3">✅ Gestionados</th>
            <th className="px-6 py-3">⏭️ Omitidos</th>
            <th className="px-6 py-3">📈 Estado</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job, index) => {
            const isExecution = job.id.includes('execute');
            const jobName = isExecution ? '🔥 Gestión de morosos' : '🔍 Simulación';
            const statusText = job.status === 'completed' ? '✅ Completado' : job.status;
            const statusColor = job.status === 'completed' ? 'text-emerald-300 bg-emerald-500/10' : 'text-amber-300 bg-amber-500/10';
            
            return (
              <tr key={job.id} className={index % 2 ? "bg-white/3" : ""}>
                <td className="px-6 py-4 font-medium text-white">{jobName}</td>
                <td className="px-6 py-4 text-slate-300">{new Date(job.timestamp).toLocaleString("es-AR")}</td>
                <td className="px-6 py-4 text-emerald-300">{job.processed}</td>
                <td className="px-6 py-4 text-amber-300">{job.skipped}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-1 text-xs ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
