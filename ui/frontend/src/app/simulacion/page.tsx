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
  FileText
} from 'lucide-react';

export default function SimulacionDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState({
    isp: 'online',
    portal: 'online',
    pos: 'online'
  });

  // Simular actualización de estado en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus({
        isp: 'online',
        portal: Math.random() > 0.1 ? 'online' : 'maintenance',
        pos: 'online'
      });
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Función para trackear navegación a otros sistemas
  const navigateToSystem = (system: 'demo' | 'portal' | 'pos') => {
    console.log(`[Navigation] Accediendo a: ${system}`);
    
    const urls = {
      demo: '/simulacion/demo-completa',
      portal: '/portal-cautivo',
      pos: '/nordia-pos'
    };
    
    window.open(urls[system], '_blank');
  };

  // Datos simulados para el dashboard
  const stats = {
    totalClientes: 1234,
    clientesActivos: 1089,
    morosos: 145,
    recuperacionRate: 78,
    ventasMes: 45678.90,
    productosVendidos: 234
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Nordia Suite
              </h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                Dashboard Demo
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-200">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Vista General</span>
            </button>
            
            <button
              onClick={() => setActiveTab('isp')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'isp' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Wifi className="w-5 h-5" />
              <span>Gestión ISP</span>
            </button>
            
            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'sales' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Ventas</span>
            </button>
            
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'products' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Productos</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'reports' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Reportes</span>
            </button>
          </nav>

          {/* Quick Access Buttons - Los 3 sistemas */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
              Acceso Rápido
            </p>
            
            <div className="space-y-2">
              {/* ISP Suite Button */}
              <button
                onClick={() => navigateToSystem('demo')}
                className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm font-medium">ISP Suite</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.isp === 'online' ? 'bg-green-300 animate-pulse' : 'bg-yellow-300'
                }`} />
              </button>
              
              {/* Portal Cautivo Button */}
              <button
                onClick={() => navigateToSystem('portal')}
                className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm font-medium">Portal Cautivo</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.portal === 'online' ? 'bg-green-300 animate-pulse' : 'bg-yellow-300'
                }`} />
              </button>
              
              {/* Nordia POS Button - NUEVO */}
              <button
                onClick={() => navigateToSystem('pos')}
                className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-[1.02] relative"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="text-sm font-medium">Nordia POS</span>
                  <span className="px-1.5 py-0.5 text-[10px] bg-yellow-400 text-gray-900 rounded font-bold">
                    NEW
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  systemStatus.pos === 'online' ? 'bg-green-300 animate-pulse' : 'bg-yellow-300'
                }`} />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vista General - Sistema Unificado
                </h2>
                <span className="px-3 py-1 text-xs bg-amber-100 text-amber-700 rounded-full font-semibold border border-amber-200">
                  📊 MODO DEMO - DATOS SIMULADOS
                </span>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Clientes Totales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100  rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 " />
                    </div>
                    <span className="flex items-center text-sm text-green-600 ">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      12%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {stats.totalClientes.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Clientes Totales
                  </p>
                </div>

                {/* Tasa de Recuperación */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100  rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 " />
                    </div>
                    <span className="flex items-center text-sm text-green-600 ">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      5%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {stats.recuperacionRate}%
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Tasa de Recuperación
                  </p>
                </div>

                {/* Ventas del Mes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100  rounded-lg">
                      <DollarSign className="w-6 h-6 text-orange-600 " />
                    </div>
                    <span className="flex items-center text-sm text-green-600 ">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      23%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    ${stats.ventasMes.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Ventas del Mes (POS)
                  </p>
                </div>

                {/* Clientes Activos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100  rounded-lg">
                      <Activity className="w-6 h-6 text-purple-600 " />
                    </div>
                    <span className="flex items-center text-sm text-green-600 ">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      8%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {stats.clientesActivos.toLocaleString()}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Clientes Activos
                  </p>
                </div>

                {/* Morosos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-red-100  rounded-lg">
                      <AlertCircle className="w-6 h-6 text-red-600 " />
                    </div>
                    <span className="flex items-center text-sm text-red-600 ">
                      <ArrowDown className="w-4 h-4 mr-1" />
                      15%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {stats.morosos}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Clientes Morosos
                  </p>
                </div>

                {/* Productos Vendidos */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-100  rounded-lg">
                      <Package className="w-6 h-6 text-indigo-600 " />
                    </div>
                    <span className="flex items-center text-sm text-green-600 ">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      31%
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 ">
                    {stats.productosVendidos}
                  </h3>
                  <p className="text-sm text-gray-600 ">
                    Productos Vendidos
                  </p>
                </div>
              </div>

              {/* Integration Status */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900  mb-4">
                  Estado de Integración
                </h3>
                
                <div className="space-y-3">
                  {/* ISP Suite Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Wifi className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 ">ISP Suite</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        systemStatus.isp === 'online' 
                          ? 'bg-green-100 text-green-700  ' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {systemStatus.isp === 'online' ? 'Operativo' : 'Mantenimiento'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Portal Cautivo Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-green-600 " />
                      <span className="font-medium text-gray-900 ">Portal Cautivo</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        systemStatus.portal === 'online' 
                          ? 'bg-green-100 text-green-700  ' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {systemStatus.portal === 'online' ? 'Operativo' : 'Mantenimiento'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Nordia POS Status */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      <span className="font-medium text-gray-900 ">Nordia POS</span>
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold">
                        NUEVO
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        systemStatus.pos === 'online' 
                          ? 'bg-green-100 text-green-700  ' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {systemStatus.pos === 'online' ? 'Operativo' : 'Mantenimiento'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Integration Info */}
                <div className="mt-6 p-4 bg-blue-50 /20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700 ">
                      <p className="font-medium mb-1">Integración Super App</p>
                      <p className="text-blue-600 dark:text-blue-400">
                        Los tres sistemas están completamente integrados. Los datos de clientes se sincronizan
                        automáticamente entre ISP Suite, Portal Cautivo y Nordia POS para una experiencia unificada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Otras tabs pueden mostrar contenido específico */}
          {activeTab === 'isp' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900  mb-6">
                Gestión ISP
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Wifi className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600  mb-4">
                  Accede al módulo completo de gestión ISP
                </p>
                <button
                  onClick={() => navigateToSystem('demo')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Abrir ISP Suite
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900  mb-6">
                Módulo de Ventas
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <p className="text-gray-600  mb-4">
                  Gestiona todas tus ventas con Nordia POS
                </p>
                <button
                  onClick={() => navigateToSystem('pos')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Abrir Nordia POS
                </button>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900  mb-6">
                Gestión de Productos
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Package className="w-16 h-16 text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
                <p className="text-gray-600  mb-4">
                  Administra tu inventario y catálogo de productos
                </p>
                <button
                  onClick={() => navigateToSystem('pos')}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Gestionar en POS
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900  mb-6">
                Reportes Consolidados
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <p className="text-gray-600  mb-6">
                  Visualiza reportes unificados de todos los sistemas
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 /20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">ISP Suite</h3>
                    <ul className="text-sm text-blue-700  space-y-1">
                      <li>• Clientes activos: 1,089</li>
                      <li>• Ancho de banda: 850 Mbps</li>
                      <li>• Tickets resueltos: 45</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 /20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Portal Cautivo</h3>
                    <ul className="text-sm text-green-700  space-y-1">
                      <li>• Morosos recuperados: 112</li>
                      <li>• Tasa de éxito: 78%</li>
                      <li>• Monto recuperado: $12,345</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 /20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Nordia POS</h3>
                    <ul className="text-sm text-orange-700  space-y-1">
                      <li>• Ventas del mes: $45,678</li>
                      <li>• Productos vendidos: 234</li>
                      <li>• Ticket promedio: $195</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
