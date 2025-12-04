'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Activity, 
  CreditCard,
  Wifi,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  AlertCircle,
  Settings,
  LogOut,
  Home,
  BarChart3,
  Package,
  FileText,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function DemoCompletaPage() {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Métricas que se actualizan en tiempo real
  const [liveMetrics, setLiveMetrics] = useState({
    clientesConectados: 847,
    clientesMorosos: 124,
    cobranzaHoy: 185420,
    cortesAutomaticos: 0,
    recuperacionExitosa: 0,
    nuevosClientes: 3
  });

  // Pasos de la simulación de recuperación de morosos
  const simulationSteps = [
    {
      title: "Detección Automática",
      description: "El sistema detecta clientes morosos en tiempo real",
      action: "detectar",
      metric: "clientesMorosos"
    },
    {
      title: "Notificación WhatsApp",
      description: "Envío automático de mensaje de recordatorio",
      action: "notificar",
      metric: "notificacionesEnviadas"
    },
    {
      title: "Portal Cautivo",
      description: "Redirección a portal de pagos al intentar navegar",
      action: "redirigir",
      metric: "portalActivado"
    },
    {
      title: "Corte de Servicio",
      description: "Corte automático si no hay respuesta en 24hs",
      action: "cortar",
      metric: "cortesAutomaticos"
    },
    {
      title: "Pago Recibido",
      description: "Cliente realiza pago a través del portal",
      action: "pagar",
      metric: "recuperacionExitosa"
    },
    {
      title: "Reconexión Automática",
      description: "Servicio restaurado automáticamente",
      action: "reconectar",
      metric: "clientesConectados"
    }
  ];

  // Efecto para la simulación en tiempo real
  useEffect(() => {
    if (!isSimulationRunning) return;

    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        clientesConectados: prev.clientesConectados + Math.floor(Math.random() * 3) - 1,
        cobranzaHoy: prev.cobranzaHoy + Math.floor(Math.random() * 15000),
        cortesAutomaticos: prev.cortesAutomaticos + (Math.random() > 0.7 ? 1 : 0),
        recuperacionExitosa: prev.recuperacionExitosa + (Math.random() > 0.8 ? 1 : 0),
        nuevosClientes: prev.nuevosClientes + (Math.random() > 0.9 ? 1 : 0)
      }));
    }, 2000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulationRunning, simulationSpeed]);

  // Avanzar pasos de simulación
  useEffect(() => {
    if (!isSimulationRunning) return;

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % simulationSteps.length);
    }, 4000 / simulationSpeed);

    return () => clearInterval(stepInterval);
  }, [isSimulationRunning, simulationSpeed, simulationSteps.length]);

  const toggleSimulation = () => {
    setIsSimulationRunning(!isSimulationRunning);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentStep(0);
    setLiveMetrics({
      clientesConectados: 847,
      clientesMorosos: 124,
      cobranzaHoy: 185420,
      cortesAutomaticos: 0,
      recuperacionExitosa: 0,
      nuevosClientes: 3
    });
  };

  const handleWhatsAppContact = () => {
    window.open('https://wa.me/5493794281273?text=Hola%2C%20quiero%20implementar%20el%20sistema%20de%20recuperaci%C3%B3n%20autom%C3%A1tica%20que%20vi%20en%20la%20demo', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/simulacion" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Volver al Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Demo Completa - Simulación en Vivo</h1>
            </div>
            
            {/* Controles de Simulación */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Velocidad:</span>
                <select 
                  value={simulationSpeed} 
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={4}>4x</option>
                </select>
              </div>
              
              <button
                onClick={toggleSimulation}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  isSimulationRunning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSimulationRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isSimulationRunning ? 'Pausar' : 'Iniciar'} Simulación
              </button>
              
              <button
                onClick={resetSimulation}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estado de Simulación */}
        {isSimulationRunning && (
          <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🔄 Simulación Activa</h3>
                <p className="text-blue-100">
                  Paso {currentStep + 1} de {simulationSteps.length}: {simulationSteps[currentStep]?.title}
                </p>
                <p className="text-sm text-blue-200 mt-1">
                  {simulationSteps[currentStep]?.description}
                </p>
              </div>
              <div className="flex items-center">
                <Activity className="w-8 h-8 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Métricas en Tiempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 transition-all ${
            isSimulationRunning ? 'border-green-500 shadow-lg' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes Conectados</p>
                <p className={`text-3xl font-bold transition-colors ${
                  isSimulationRunning ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {liveMetrics.clientesConectados.toLocaleString()}
                </p>
              </div>
              <Wifi className={`w-8 h-8 ${isSimulationRunning ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
            {isSimulationRunning && (
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Actualizando en tiempo real
              </p>
            )}
          </div>

          <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 transition-all ${
            isSimulationRunning ? 'border-blue-500 shadow-lg' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cobranza Hoy</p>
                <p className={`text-3xl font-bold transition-colors ${
                  isSimulationRunning ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  ${liveMetrics.cobranzaHoy.toLocaleString()}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${isSimulationRunning ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            {isSimulationRunning && (
              <p className="text-xs text-blue-600 mt-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{Math.floor(Math.random() * 50) + 10}% vs ayer
              </p>
            )}
          </div>

          <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 transition-all ${
            isSimulationRunning ? 'border-orange-500 shadow-lg' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recuperación Exitosa</p>
                <p className={`text-3xl font-bold transition-colors ${
                  isSimulationRunning ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {liveMetrics.recuperacionExitosa}
                </p>
              </div>
              <Zap className={`w-8 h-8 ${isSimulationRunning ? 'text-orange-500' : 'text-gray-400'}`} />
            </div>
            {isSimulationRunning && (
              <p className="text-xs text-orange-600 mt-2">
                Morosos recuperados automáticamente
              </p>
            )}
          </div>
        </div>

        {/* Flujo de Proceso */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Flujo de Recuperación Automática de Morosos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulationSteps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-2 transition-all duration-500 ${
                  currentStep === index && isSimulationRunning
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : index < currentStep && isSimulationRunning
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep === index && isSimulationRunning
                      ? 'bg-blue-500 text-white'
                      : index < currentStep && isSimulationRunning
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {currentStep === index && isSimulationRunning && (
                    <Activity className="w-4 h-4 ml-2 text-blue-500 animate-pulse" />
                  )}
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Final */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            ¿Impresionado con la Automatización?
          </h3>
          <p className="text-green-100 text-lg mb-6 max-w-2xl mx-auto">
            Esta demo muestra solo una fracción del poder de Nordia ISP Suite. 
            Implementa este sistema en tu ISP y aumenta tu cobranza del 30% al 85%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
              </svg>
              Quiero Implementarlo Ya
            </button>
            <span className="text-green-200 text-sm">
              Setup: $200,000 ARS • Mensual: $50,000 ARS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
