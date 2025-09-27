interface Job {
  id: string;
  timestamp: string;
  mode: string;
  processed: number;
  skipped: number;
  status: string;
}

export const JobsTimeline = ({ jobs }: { jobs: Job[] }) => {
  return (
    <section className="h-full rounded-2xl border border-white/10 bg-slate-900/50 p-6">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">⏰ Últimas acciones</h2>
        <span className="text-xs uppercase tracking-widest text-slate-400">🔄 En tiempo real</span>
      </header>
      <ol className="space-y-4">
        {jobs.map((job) => {
          const isExecution = job.id.includes('execute');
          const actionIcon = isExecution ? '🔥' : '🔍';
          const actionName = isExecution ? 'Gestión automática' : 'Simulación';
          const modeText = job.mode === 'execute' ? '🔥 EJECUTADO' : '🔍 SIMULADO';
          
          return (
            <li key={job.id} className="relative border-l border-white/10 pl-4">
              <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-emerald-400" />
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span className="font-medium text-white">{actionIcon} {actionName}</span>
                <span className="text-slate-400">{new Date(job.timestamp).toLocaleString("es-AR", { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {modeText} · {job.processed} gestionados · {job.skipped} omitidos
              </p>
              <span className="mt-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                ✅ {job.status === 'completed' ? 'Completado' : job.status}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
