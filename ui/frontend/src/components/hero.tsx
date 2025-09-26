'use client';

import React, { useState } from 'react';
import { ArrowRight, Wifi, ShoppingBag, Play } from 'lucide-react';

export default function Hero() {
  const [clickCounts, setClickCounts] = useState({
    demo: 0,
    portal: 0,
    pos: 0
  });

  // Función para trackear clicks (preparado para analytics)
  const trackClick = (button: 'demo' | 'portal' | 'pos') => {
    setClickCounts(prev => ({
      ...prev,
      [button]: prev[button] + 1
    }));
    
    // Aquí se podría integrar con Google Analytics o cualquier servicio de analytics
    console.log(`[Analytics] Click en botón: ${button}, Total clicks: ${clickCounts[button] + 1}`);
  };

  const handleDemoClick = () => {
    trackClick('demo');
    window.open('/simulacion', '_blank');
  };

  const handlePortalClick = () => {
    trackClick('portal');
    window.open('/portal-cautivo', '_blank');
  };

  const handlePOSClick = () => {
    trackClick('pos');
    // URL temporal - preparado para futuro deploy
    window.open('/nordia-pos', '_blank');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Logo y título principal */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 animate-fade-in">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                Nordia
              </span>{' '}
              <span className="text-white">ISP Suite</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              Sistema Integral de Gestión para ISPs Modernos
            </p>
          </div>

          {/* Descripción principal */}
          <div className="mb-12 space-y-4">
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Gestiona tu ISP, recupera morosos automáticamente y aumenta tus ventas con nuestra plataforma todo-en-uno
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                99.9% Uptime
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                +500 ISPs Activos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                +50k Usuarios Gestionados
              </span>
            </div>
          </div>

          {/* Botones principales - 3 accesos */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* Botón Demo en Vivo */}
            <button
              onClick={handleDemoClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Play className="w-5 h-5 mr-2" />
              <span className="relative">Ver DEMO en Vivo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Botón Portal Cautivo */}
            <button
              onClick={handlePortalClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Wifi className="w-5 h-5 mr-2" />
              <span className="relative">Portal Cautivo</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Botón Nordia POS - NUEVO */}
            <button
              onClick={handlePOSClick}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <ShoppingBag className="w-5 h-5 mr-2" />
              <span className="relative">Nordia POS</span>
              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-400 text-gray-900 rounded-full font-bold">NUEVO</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Features cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
            {/* ISP Management */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gestión ISP</h3>
              <p className="text-gray-400">
                Control total de tu red, clientes y servicios. Automatiza cobros y gestiona morosos eficientemente.
              </p>
            </div>

            {/* Portal Cautivo */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Portal Cautivo</h3>
              <p className="text-gray-400">
                Recuperación automática de morosos con portal cautivo inteligente y múltiples opciones de pago.
              </p>
            </div>

            {/* Sistema POS */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors relative">
              <div className="absolute top-4 right-4">
                <span className="px-2 py-1 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold">
                  NUEVO
                </span>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sistema POS</h3>
              <p className="text-gray-400">
                Punto de venta integrado para gestionar productos, servicios y facturación en un solo lugar.
              </p>
            </div>
          </div>

          {/* Call to action secundario */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">
              ¿Listo para transformar tu ISP?
            </p>
            <a
              href="mailto:contacto@nordia.com"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contacta con nosotros
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </div>

          {/* Debug info - Solo visible en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-black/50 rounded-lg text-xs text-gray-500 max-w-md mx-auto">
              <p>🔍 Analytics Debug:</p>
              <p>Demo clicks: {clickCounts.demo}</p>
              <p>Portal clicks: {clickCounts.portal}</p>
              <p>POS clicks: {clickCounts.pos}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
