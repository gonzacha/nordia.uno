'use client';

import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Users, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

export default function NordiaPOSPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profesional' | 'enterprise'>('profesional');

  const plans = {
    'basico': {
      name: 'POS Básico',
      description: 'Para ISPs que venden solo servicios de internet',
      price: '$25,000/mes',
      features: ['Planes de internet hasta 100 Mbps', 'Equipamiento básico', 'Servicios técnicos', 'Reportes básicos']
    },
    'profesional': {
      name: 'POS Profesional', 
      description: 'Para ISPs con casa de informática',
      price: '$45,000/mes',
      features: ['Todos los planes de internet', 'Equipamiento completo', 'Productos informática', 'Gestión de inventario', 'Reportes avanzados']
    },
    'enterprise': {
      name: 'POS Enterprise',
      description: 'Para ISPs diversificados (como Wispana)',
      price: '$65,000/mes',
      features: ['Catálogo completo', 'Paneles solares', 'Sistemas de seguridad', 'Multi-sucursal', 'API integración', 'Soporte 24/7']
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Hola, quiero información sobre Nordia POS ${plans[selectedPlan].name}`;
    window.open(`https://wa.me/5493794281273?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            <div className="flex items-center">
              <ShoppingBag className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Nordia POS</h1>
              <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                NUEVO
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            POS Especializado para ISPs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Sistema de punto de venta diseñado específicamente para ISPs. Vende planes de internet, 
            equipamiento, servicios técnicos, informática, paneles solares y más.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Package className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">60+</div>
              <div className="text-gray-600">Servicios y Productos</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">ISP</div>
              <div className="text-gray-600">Especializado</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900">Configurable</div>
              <div className="text-gray-600">Por Cliente</div>
            </div>
          </div>
        </div>

        {/* Plan Selector */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Elige el plan perfecto para tu ISP
          </h3>
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-xl">
              {Object.entries(plans).map(([key, plan]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key as 'basico' | 'profesional' | 'enterprise')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlan === key
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {plan.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Plan Details */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 text-white">
              <h4 className="text-3xl font-bold mb-2">{plans[selectedPlan].name}</h4>
              <p className="text-orange-100 text-lg mb-4">{plans[selectedPlan].description}</p>
              <div className="text-4xl font-bold">{plans[selectedPlan].price}</div>
            </div>
            
            <div className="p-8">
              <h5 className="text-xl font-semibold text-gray-900 mb-6">Características incluidas:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {plans[selectedPlan].features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Products Preview */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <h6 className="font-semibold text-gray-900 mb-4">Catálogo de servicios y productos:</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                  {selectedPlan === 'basico' && (
                    <>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🌐 Planes de Internet</h6>
                        <div>• Internet 1, 2, 5, 10 Mbps</div>
                        <div>• Internet 20, 30, 50 Mbps</div>
                        <div>• Internet 100 Mbps</div>
                        <div>• IP Fija Dedicada</div>
                        <div>• WiFi Comunitario</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🔧 Equipamiento Básico</h6>
                        <div>• Routers WiFi</div>
                        <div>• Cables UTP</div>
                        <div>• Conectores RJ45</div>
                        <div>• Servicios técnicos</div>
                        <div>• Instalaciones</div>
                      </div>
                    </>
                  )}
                  {selectedPlan === 'profesional' && (
                    <>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🌐 Internet Completo</h6>
                        <div>• Todos los planes hasta 500 Mbps</div>
                        <div>• Internet Empresarial</div>
                        <div>• IP Fija y WiFi Comunitario</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">💻 Casa de Informática</h6>
                        <div>• Computadoras y Notebooks</div>
                        <div>• Monitores e Impresoras</div>
                        <div>• Periféricos completos</div>
                        <div>• Almacenamiento SSD</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🔧 Equipamiento Pro</h6>
                        <div>• Antenas Ubiquiti</div>
                        <div>• Switches Gigabit</div>
                        <div>• ONT Fibra Óptica</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🛠️ Servicios Técnicos</h6>
                        <div>• Soporte Premium 24hs</div>
                        <div>• Instalaciones especializadas</div>
                        <div>• Mantenimiento preventivo</div>
                      </div>
                    </>
                  )}
                  {selectedPlan === 'enterprise' && (
                    <>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🌐 Internet Enterprise</h6>
                        <div>• Catálogo completo hasta 500 Mbps</div>
                        <div>• Planes empresariales dedicados</div>
                        <div>• Soluciones corporativas</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">☀️ Paneles Solares</h6>
                        <div>• Paneles 330W y 450W</div>
                        <div>• Inversores 3000W y 5000W</div>
                        <div>• Baterías y reguladores</div>
                        <div>• Instalación completa</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🔒 Sistemas de Seguridad</h6>
                        <div>• Cámaras IP WiFi HD</div>
                        <div>• Sistemas DVR</div>
                        <div>• UPS y estabilizadores</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">💻 Informática Completa</h6>
                        <div>• Todo el catálogo informático</div>
                        <div>• Equipamiento profesional</div>
                        <div>• Infraestructura de red</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={handleWhatsAppContact}
                  className="inline-flex items-center px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                  </svg>
                  Solicitar Demo de {plans[selectedPlan].name}
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Configuración e instalación incluida • Soporte técnico completo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16 p-8 bg-white rounded-xl shadow-sm">
          <h4 className="text-xl font-semibold text-gray-900 mb-4">
            Integración Completa con tu ISP
          </h4>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nordia POS se integra perfectamente con tu sistema ISP existente. 
            Gestiona tu negocio de internet y ventas desde una sola plataforma unificada.
          </p>
        </div>
      </div>
    </div>
  );
}