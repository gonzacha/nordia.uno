'use client';

import React, { useState } from 'react';
import { ArrowRight, Wifi, Play } from 'lucide-react';

export default function Hero() {
  const [clickCounts, setClickCounts] = useState({
    whatsapp: 0,
    demo: 0
  });

  // Función para trackear clicks (preparado para analytics)
  const trackClick = (button: 'whatsapp' | 'demo') => {
    setClickCounts(prev => ({
      ...prev,
      [button]: prev[button] + 1
    }));
    
    // Analytics tracking - ready for Google Analytics integration
    console.log(`[Analytics] Click en botón: ${button}, Total clicks: ${clickCounts[button] + 1}`);
  };

  const handleWhatsAppClick = () => {
    trackClick('whatsapp');
    window.open('https://wa.me/5493794281273?text=Hola%2C%20quiero%20una%20consulta%20gratuita%20sobre%20Nordia%20ISP%20Suite%20y%20el%20sistema%20de%20recuperaci%C3%B3n%20de%20morosos', '_blank');
  };

  const handleDemoClick = () => {
    trackClick('demo');
    window.open('/simulacion', '_blank');
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
              Aumenta tu cobranza del 30% al 85% con monitoreo automático 24/7 y cortes de servicio inteligentes
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                85% Recuperación de Morosos
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                Monitoreo 24/7 Automático
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                100 Cortes en 5 Minutos
              </span>
            </div>
          </div>

          {/* CTA Principal Enterprise */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {/* Botón Demostración Principal */}
            <button
              onClick={handleDemoClick}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 shadow-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-700 to-purple-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <Play className="w-6 h-6 mr-3" />
              <span className="relative">Ver Demostración</span>
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Botón WhatsApp */}
            <button
              onClick={handleWhatsAppClick}
              className="group relative inline-flex items-center justify-center px-8 py-5 text-xl font-medium text-gray-800 bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-gray-200 hover:border-green-500"
            >
              <svg className="w-6 h-6 mr-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
              </svg>
              <span className="relative">Contactar Ahora</span>
            </button>
          </div>

          {/* Características Principales - Enterprise Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 max-w-4xl mx-auto">
            {/* Gestión Integral */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Recuperación Automática</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Sistema automático de recuperación de morosos que aumenta tu cobranza del 30% al 85%. 
                Integración directa con MikroTik para cortes de servicio automáticos.
              </p>
              <div className="mt-4 flex items-center text-blue-400 font-medium">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Garantía de resultados o devolución
              </div>
            </div>

            {/* Tecnología Avanzada */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Portal de Pagos 24/7</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Portal automático con notificaciones vía WhatsApp, SMS y email. 
                Pasarela de pagos integrada disponible las 24 horas del día.
              </p>
              <div className="mt-4 flex items-center text-green-400 font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Plan Fundador: Solo 5 cupos disponibles
              </div>
            </div>
          </div>

          {/* Testimonial Enterprise */}
          <div className="mt-20 text-center">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 max-w-3xl mx-auto border border-white/10">
              <blockquote className="text-xl text-gray-300 italic mb-6">
                "Pasamos del 30% al 85% de cobranza en los primeros 90 días. El sistema automático 
                de cortes y el portal de pagos 24/7 nos ahorraron horas de trabajo manual diario."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">MR</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">Miguel Rodríguez</p>
                  <p className="text-gray-400 text-sm">Director, ConectaNet ISP</p>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 text-center">
            <p className="text-gray-300 text-lg mb-6">
              Plan Fundador: Solo quedan 5 cupos disponibles
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                </svg>
                Consulta Gratuita
              </button>
              <button
                onClick={handleDemoClick}
                className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Ver Demo Completa
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
