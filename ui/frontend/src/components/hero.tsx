"use client";

import { motion } from "framer-motion";
import { useBrand } from "./brand-provider";
import Link from "next/link";

export const Hero = () => {
  const brand = useBrand();
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative rounded-3xl bg-slate-900/80 p-10 shadow-glow ring-1 ring-white/10 overflow-hidden"
      style={{
        backgroundImage: "url('/isp-network-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/40 rounded-3xl"></div>
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-400">💰 Recuperación de Morosidad</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">
            Recuperamos tu dinero perdido
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            Sistema especializado que recupera automáticamente el dinero que perdés por morosos. <span className="text-emerald-400 font-semibold">ROI 1,500% en 30 días.</span>
          </p>
          
          {/* Botones de acción */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link 
              href="/simulacion"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">🎮</span>
              <div className="text-left">
                <div className="font-semibold">Ver DEMO en Vivo</div>
                <div className="text-sm opacity-90">Con datos reales</div>
              </div>
            </Link>
            
            {/* Portal Cautivo Button */}
            <button 
              onClick={() => window.open('/portal-cautivo', '_blank')}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-xl font-medium text-white transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">🔐</span>
              <div className="text-left">
                <div className="font-semibold">Portal Cautivo</div>
                <div className="text-sm opacity-90">Gestión de acceso</div>
              </div>
            </button>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-6 py-5 text-sm text-slate-300">
          <span className="text-xs uppercase tracking-widest text-orange-400">💰 Dinero Recuperable</span>
          <span className="text-lg font-medium text-orange-300">$2M+ ARS por mes</span>
          <p className="max-w-sm text-orange-200">
            Promedio que recuperan nuestros clientes con 500+ clientes morosos.
          </p>
        </div>
      </div>
    </motion.section>
  );
};
