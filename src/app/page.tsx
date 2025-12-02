import Hero from "../components/Hero";
import Manifiesto from "../components/Manifiesto";
import Portfolio from "../components/Portfolio";
import QueEsNordia from "../components/QueEsNordia";
import Services from "../components/Services";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <Hero />
      <div className="px-4 sm:px-6 lg:px-12 pb-24 space-y-20">
        <QueEsNordia />
        <Services />
        <Portfolio />
        <Manifiesto />
      </div>
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 sm:px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-sm text-slate-400">
          <div>
            <p className="font-semibold text-slate-200">Nordia</p>
            <p>Inteligencia situacional aplicada para PyMEs.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://wa.me/5493794815782"
              target="_blank"
              rel="noreferrer"
              className="text-slate-100 font-medium hover:text-emerald-300 transition-colors"
            >
              Hablemos en WhatsApp
            </a>
            <a href="mailto:hola@nordia.uno" className="hover:text-emerald-300 transition-colors">
              hola@nordia.uno
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
