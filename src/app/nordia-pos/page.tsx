'use client';

import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Users, TrendingUp, Package } from 'lucide-react';
import Link from 'next/link';

export default function NordiaPOSPage() {
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'profesional' | 'enterprise'>('profesional');

  const plans = {
    'basico': {
      name: 'POS ISP Básico',
      description: 'Para ISPs locales (100-500 clientes)',
      price: '$125,000/mes',
      features: ['Gestión de planes residenciales', 'Equipamiento WiFi básico', 'Instalaciones domiciliarias', 'Facturación automática', 'Reportes básicos']
    },
    'profesional': {
      name: 'POS ISP Profesional', 
      description: 'Para ISPs regionales (500+ clientes)',
      price: '$185,000/mes',
      features: ['Planes empresariales', 'Equipamiento profesional', 'Servicios corporativos', 'Múltiples sucursales', 'CRM integrado', 'Reportes avanzados']
    },
    'enterprise': {
      name: 'POS ISP Enterprise',
      description: 'Para ISPs diversificados y grandes operadores',
      price: '$285,000/mes',
      features: ['Catálogo completo ISP', 'Servicios empresariales', 'Productos complementarios', 'Integración con proveedores', 'API completa', 'Soporte 24/7']
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
                        <h6 className="font-semibold text-gray-800">🏠 Internet Residencial (Fibra)</h6>
                        <div>• 100 Mbps - $19,000/mes</div>
                        <div>• 300 Mbps - $21,000/mes</div>
                        <div>• 500 Mbps - $21,500/mes</div>
                        <div>• 1000 Mbps (1 Giga) - $19,000/mes</div>
                        <div>• Instalación fibra - Bonificada</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">📡 Internet Rural (WISP)</h6>
                        <div>• 10 Mbps Zona 1 - $11,000/mes</div>
                        <div>• 12 Mbps Zona 2 - $23,700/mes</div>
                        <div>• Instalación WISP - $45,000-$70,000</div>
                        <div>• Router incluido</div>
                        <div>• Soporte técnico - $8,000/visita</div>
                      </div>
                    </>
                  )}
                  {selectedPlan === 'profesional' && (
                    <>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🏢 Planes Empresariales 2025</h6>
                        <div>• 100 Mbps Corp - $135,000/mes</div>
                        <div>• 300 Mbps Corp - $255,000/mes</div>
                        <div>• 500 Mbps Corp - $450,000/mes</div>
                        <div>• IP Fija Dedicada - $75,000/mes</div>
                        <div>• Backup 4G - $55,000/mes</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🔧 Equipamiento Pro 2025</h6>
                        <div>• Ubiquiti NanoStation 5GHz - $285,000</div>
                        <div>• Switch 24 puertos Gigabit - $420,000</div>
                        <div>• Firewall Mikrotik - $335,000</div>
                        <div>• ONT Fibra Óptica - $125,000</div>
                        <div>• UPS 2000VA - $650,000</div>
                        <div>• Router WiFi Pro - $125,000</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🛠️ Servicios Corporativos 2025</h6>
                        <div>• Instalación empresarial - $125,000</div>
                        <div>• Soporte Premium 24hs - $85,000/mes</div>
                        <div>• Mantenimiento preventivo - $55,000/mes</div>
                        <div>• Monitoreo 24/7 - $65,000/mes</div>
                        <div>• Consultoría de red - $155,000</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">💻 Servicios Adicionales 2025</h6>
                        <div>• Hosting web - $25,000/mes</div>
                        <div>• Email corporativo - $12,000/mes</div>
                        <div>• Backup en la nube - $35,000/mes</div>
                        <div>• VPN empresarial - $45,000/mes</div>
                        <div>• Licencias Office 365 - $35,000/mes</div>
                      </div>
                    </>
                  )}
                  {selectedPlan === 'enterprise' && (
                    <>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🌐 Enlaces Dedicados 2025</h6>
                        <div>• Enlace dedicado 10 Mbps - $385,000/mes</div>
                        <div>• Enlace dedicado 50 Mbps - $1,250,000/mes</div>
                        <div>• Enlace dedicado 100 Mbps - $2,150,000/mes</div>
                        <div>• Data center y colocación - $450,000/mes</div>
                        <div>• Tránsito IP internacional - desde $850,000/mes</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">☀️ Energía Solar 2025 (Wispana)</h6>
                        <div>• Panel 450W - $650,000</div>
                        <div>• Inversor 5000W - $1,850,000</div>
                        <div>• Batería Litio 200Ah - $1,350,000</div>
                        <div>• Kit instalación - $550,000</div>
                        <div>• Proyecto llave en mano - desde $8,500,000</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">💻 Tecnología e Informática</h6>
                        <div>• PC Empresarial - $2,850,000</div>
                        <div>• Servidor Dell - $8,500,000</div>
                        <div>• Licencias Office 365 - $35,000/mes</div>
                        <div>• Backup enterprise - $125,000/mes</div>
                        <div>• Soporte especializado - $185,000/mes</div>
                      </div>
                      <div className="space-y-2">
                        <h6 className="font-semibold text-gray-800">🔒 Seguridad y Monitoreo 2025</h6>
                        <div>• Cámaras IP 4K - $445,000</div>
                        <div>• DVR 16 canales - $985,000</div>
                        <div>• Alarmas inteligentes - $295,000</div>
                        <div>• Monitoreo 24/7 - $125,000/mes</div>
                        <div>• Control de acceso - $650,000</div>
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