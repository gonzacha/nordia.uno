"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Cliente {
  username: string;
  dni: string;
  nombre: string;
  dias_mora: number;
  monto_deuda: number;
  excepcion: boolean;
  telefono: string;
  estado: "activo" | "procesando" | "cortado";
}

const clientesReales: Cliente[] = [
  { username: "juan.perez", dni: "12345678", nombre: "Juan Pérez", dias_mora: 45, monto_deuda: 15000.50, excepcion: false, telefono: "+5493794123456", estado: "activo" },
  { username: "maria.gonzalez", dni: "23456789", nombre: "María González", dias_mora: 32, monto_deuda: 8500.25, excepcion: false, telefono: "", estado: "activo" },
  { username: "carlos.martinez", dni: "34567890", nombre: "Carlos Martínez", dias_mora: 67, monto_deuda: 22000.00, excepcion: false, telefono: "+5493794234567", estado: "activo" },
  { username: "ana.rodriguez", dni: "45678901", nombre: "Ana Rodríguez", dias_mora: 15, monto_deuda: 5500.75, excepcion: true, telefono: "+5493794345678", estado: "activo" },
  { username: "luis.fernandez", dni: "56789012", nombre: "Luis Fernández", dias_mora: 89, monto_deuda: 35000.00, excepcion: false, telefono: "", estado: "activo" },
  { username: "patricia.ruiz", dni: "89012345", nombre: "Patricia Ruiz", dias_mora: 34, monto_deuda: 12500.00, excepcion: false, telefono: "+5493794567890", estado: "activo" },
  { username: "carmen.silva", dni: "01234567", nombre: "Carmen Silva", dias_mora: 41, monto_deuda: 16800.75, excepcion: false, telefono: "", estado: "activo" },
  { username: "miguel.vargas", dni: "33333333", nombre: "Miguel Vargas", dias_mora: 125, monto_deuda: 45000.25, excepcion: false, telefono: "", estado: "activo" },
  { username: "natalia.romero", dni: "66666666", nombre: "Natalia Romero", dias_mora: 56, monto_deuda: 19500.30, excepcion: false, telefono: "", estado: "activo" }
];

export default function SimulacionPage() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesReales);
  const [modo, setModo] = useState<"simulacion" | "real">("simulacion");
  const [ejecutando, setEjecutando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [clienteActual, setClienteActual] = useState<string>("");
  const [estadisticas, setEstadisticas] = useState({
    procesados: 0,
    cortados: 0,
    protegidos: 0,
    total: 0
  });

  const clientesParaCorte = clientes.filter(c => c.dias_mora >= 30 && !c.excepcion);

  const resetSimulacion = () => {
    setClientes(clientesReales.map(c => ({ ...c, estado: "activo" })));
    setProgreso(0);
    setClienteActual("");
    setEstadisticas({ procesados: 0, cortados: 0, protegidos: 0, total: 0 });
  };

  const ejecutarCortes = async () => {
    if (ejecutando) return;
    
    setEjecutando(true);
    resetSimulacion();
    
    const clientesACortar = clientesParaCorte;
    const totalClientes = clientesACortar.length;
    
    for (let i = 0; i < totalClientes; i++) {
      const cliente = clientesACortar[i];
      setClienteActual(cliente.nombre);
      
      setClientes(prev => prev.map(c => 
        c.username === cliente.username ? { ...c, estado: "procesando" } : c
      ));
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setClientes(prev => prev.map(c => 
        c.username === cliente.username ? { ...c, estado: "cortado" } : c
      ));
      
      const nuevoProgreso = ((i + 1) / totalClientes) * 100;
      setProgreso(nuevoProgreso);
      
      setEstadisticas({
        procesados: i + 1,
        cortados: i + 1,
        protegidos: clientes.filter(c => c.excepcion).length,
        total: clientes.length
      });
    }
    
    setClienteActual("");
    setEjecutando(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <span>←</span> Volver al Dashboard
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">
            🎮 Simulador de Cortes por Mora
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Simulá cómo funciona nuestro sistema de gestión automática de morosos con datos CSV reales. 
            Elegí entre modo simulación (seguro) o ejecución real.
          </p>
        </motion.div>

        {/* Selector de Modo y Portal Cautivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setModo("simulacion")}
              disabled={ejecutando}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                modo === "simulacion" 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              } ${ejecutando ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              🔍 Modo Simulación
            </button>
            <button
              onClick={() => setModo("real")}
              disabled={ejecutando}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                modo === "real" 
                  ? "bg-red-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              } ${ejecutando ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              🔥 Modo Ejecución Real
            </button>
            
            {/* Portal Cautivo en Dashboard */}
            <button
              onClick={() => window.open('/portal-cautivo', '_blank')}
              className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all transform hover:scale-105 shadow-lg"
            >
              🔐 Portal Cautivo
            </button>
          </div>
        </motion.div>

        {/* KPIs en tiempo real */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-slate-900/60 rounded-xl p-4 ring-1 ring-white/10">
            <div className="text-2xl font-bold text-emerald-400">{estadisticas.procesados}</div>
            <div className="text-sm text-slate-400">Procesados</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 ring-1 ring-white/10">
            <div className="text-2xl font-bold text-red-400">{estadisticas.cortados}</div>
            <div className="text-sm text-slate-400">Cortados</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 ring-1 ring-white/10">
            <div className="text-2xl font-bold text-blue-400">{estadisticas.protegidos}</div>
            <div className="text-sm text-slate-400">Protegidos</div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 ring-1 ring-white/10">
            <div className="text-2xl font-bold text-slate-300">{estadisticas.total}</div>
            <div className="text-sm text-slate-400">Total Clientes</div>
          </div>
        </motion.div>

        {/* Barra de progreso */}
        {ejecutando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="bg-slate-800 rounded-full h-3 mb-2">
              <motion.div
                className="bg-gradient-to-r from-emerald-500 to-blue-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-center">
              <span className="text-slate-300">{Math.round(progreso)}% completado</span>
              {clienteActual && (
                <span className="text-emerald-400 ml-4">
                  Cliente actual: {clienteActual}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Botón principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <button
            onClick={ejecutarCortes}
            disabled={ejecutando}
            className={`text-xl px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
              ejecutando 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : modo === "real"
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
                  : "bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg"
            }`}
          >
            {ejecutando ? (
              <span className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                PROCESANDO...
              </span>
            ) : (
              `🎮 ${modo === "real" ? "EJECUTAR" : "SIMULAR"} CORTES POR MORA`
            )}
          </button>
          
          {!ejecutando && (
            <button
              onClick={resetSimulacion}
              className="ml-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              🔄 Reiniciar
            </button>
          )}
        </motion.div>

        {/* Tabla de clientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/60 rounded-xl p-6 ring-1 ring-white/10 overflow-x-auto"
        >
          <h3 className="text-xl font-bold mb-4">📊 Estados de Clientes en Tiempo Real</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Días Mora</th>
                  <th className="text-left p-3">Deuda</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-left p-3">Protección</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <motion.tr 
                    key={cliente.username}
                    className="border-b border-slate-800"
                    animate={cliente.estado === "procesando" ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 1, repeat: cliente.estado === "procesando" ? Infinity : 0 }}
                  >
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{cliente.nombre}</div>
                        <div className="text-xs text-slate-400">{cliente.username}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={cliente.dias_mora >= 30 ? "text-red-400 font-medium" : "text-slate-300"}>
                        {cliente.dias_mora} días
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      ${cliente.monto_deuda.toLocaleString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cliente.estado === "activo" 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : cliente.estado === "procesando"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {cliente.estado === "activo" ? "✅ ACTIVO" : 
                         cliente.estado === "procesando" ? "🔄 PROCESANDO" : 
                         "❌ CORTADO"}
                      </span>
                    </td>
                    <td className="p-3">
                      {cliente.excepcion ? (
                        <span className="text-amber-400 font-medium">🛡️ PROTEGIDO</span>
                      ) : cliente.dias_mora >= 30 ? (
                        <span className="text-red-400">🎯 PARA CORTE</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
}