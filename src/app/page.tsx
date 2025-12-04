import Hero from "@/components/Hero";
import Manifiesto from "@/components/Manifiesto";
import Portfolio from "@/components/Portfolio";
import QueEsNordia from "@/components/QueEsNordia";
import Services from "@/components/Services";
import { Mail, MessageSquare } from "lucide-react";

export default function Page() {
  return (
    <main className="min-h-screen bg-slate-950 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <Hero />
      
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-32 space-y-32">
        <QueEsNordia />
        <Services />
        <Portfolio />
        <Manifiesto />
      </div>

      <footer className="relative z-10 border-t border-slate-800/60 bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-tight">Nordia.</h3>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Inteligencia situacional aplicada. <br />
              Sistemas de control y operación para empresas reales.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <a
              href="https://wa.me/5493794815782"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>WhatsApp Directo</span>
            </a>
            <a 
              href="mailto:founders@nordia.uno" 
              className="group flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>founders@nordia.uno</span>
            </a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-900 flex justify-between items-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Nordia.</p>
          <p>Operaciones &amp; Sistemas.</p>
        </div>
      </footer>
    </main>
  );
}
