import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Package,
  BarChart3,
  Store,
  DollarSign,
  Check,
  X,
  ArrowRight,
  MessageCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nordia POS - El sistema de ventas para comercios de barrio',
  description: 'Sistema de ventas que funciona sin internet. Gratis para carnicerias, verdulerias, kioscos y comercios de barrio en Argentina.',
  openGraph: {
    title: 'Nordia POS - Cobra y lleva tu negocio al dia',
    description: 'Funciona aunque se corte internet. Pensado para el carnicero, el almacenero y el kiosco de la esquina.',
    type: 'website',
    siteName: 'Nordia POS',
  },
};

const verticales = [
  { icon: '🥩', nombre: 'Carniceria' },
  { icon: '🥬', nombre: 'Verduleria' },
  { icon: '🍞', nombre: 'Panaderia' },
  { icon: '🛒', nombre: 'Kiosco' },
  { icon: '💄', nombre: 'Cosmetica' },
  { icon: '🏪', nombre: 'Almacen' },
  { icon: '👗', nombre: 'Indumentaria' },
  { icon: '🔧', nombre: 'Y mas...' },
];

const features = [
  {
    icon: Smartphone,
    titulo: 'Usalo desde tu celular',
    descripcion: 'No necesitas computadora ni equipos caros. Se instala como una app.',
  },
  {
    icon: WifiOff,
    titulo: 'Funciona sin internet',
    descripcion: 'Vende aunque se corte la luz o el wifi. Cuando vuelve, sincroniza solo.',
  },
  {
    icon: Package,
    titulo: 'Control de stock real',
    descripcion: 'Sabe que tenes, que falta, que se pierde. Alertas cuando queda poco.',
  },
  {
    icon: BarChart3,
    titulo: 'Tus numeros claros',
    descripcion: 'Mira cuanto vendes sin ser contador. Dashboard simple y util.',
  },
  {
    icon: Store,
    titulo: 'Para tu rubro',
    descripcion: 'Carniceria, verduleria, kiosco, panaderia. Cada negocio tiene lo suyo.',
  },
  {
    icon: DollarSign,
    titulo: 'Precio justo',
    descripcion: 'Gratis para empezar. Pro cuando lo necesites.',
  },
];

const problemas = [
  'Anotas todo en cuaderno y perdes el control',
  'Se corta internet justo cuando queres cobrar',
  'Los sistemas son muy caros o muy complicados',
  'No sabes cuanto vendes ni cuanto ganas',
  'El stock es un quilombo',
];

const soluciones = [
  'Todo digital, reportes automaticos',
  'Funciona sin internet, sincroniza despues',
  'Gratis para empezar, simple de usar',
  'Sabes exactamente cuanto entra y sale',
  'Control de stock con alertas',
];

export default function POSLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 to-amber-100/30" />
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-20 sm:pt-20 sm:pb-32">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">Nordia POS</span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Cobra y lleva tu negocio al dia,
              <span className="text-orange-600"> sin dejar de ser vos.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 mb-4">
              Funciona aunque se corte internet. Sin vueltas ni palabras raras.
            </p>
            <p className="text-lg text-gray-500 mb-10">
              Pensado para el carnicero, el almacenero y el kiosco de la esquina.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="https://nordia-pos-real.vercel.app/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
              >
                Quiero probar Nordia gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="https://nordia-pos-real.vercel.app"
                className="text-gray-600 hover:text-orange-600 font-medium transition-colors"
              >
                Ver como funciona →
              </Link>
            </div>
          </div>

          {/* Mockup placeholder */}
          <div className="mt-16 max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-2 border border-gray-100">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center">
                <div className="w-20 h-20 bg-orange-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="w-10 h-10 text-orange-600" />
                </div>
                <p className="text-gray-600 text-sm">Vista previa de la app</p>
                <p className="text-orange-600 font-medium mt-1">Instalala en tu celular</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema → Solucion */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Si tenes un comercio en Argentina...
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            esto te va a sonar conocido
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Problemas */}
            <div className="bg-red-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-red-800 mb-6">El problema</h3>
              <ul className="space-y-4">
                {problemas.map((problema, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-200 flex items-center justify-center mt-0.5">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-gray-700">{problema}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soluciones */}
            <div className="bg-green-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-green-800 mb-6">Con Nordia POS</h3>
              <ul className="space-y-4">
                {soluciones.map((solucion, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-200 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">{solucion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Todo lo que necesitas
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Simple, sin vueltas, funciona
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.titulo}
                </h3>
                <p className="text-gray-600">{feature.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticales */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            Pensado para comercios como el tuyo
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Cada rubro tiene sus necesidades
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {verticales.map((vertical, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 text-center hover:from-orange-100 hover:to-amber-100 transition-colors cursor-default"
              >
                <span className="text-4xl mb-2 block">{vertical.icon}</span>
                <span className="text-gray-800 font-medium">{vertical.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Elegi tu plan
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Gratis */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">GRATIS</h3>
                <div className="text-4xl font-bold text-gray-900 mt-2">$0</div>
                <p className="text-gray-500 mt-1">Para siempre</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '1 usuario',
                  '100 ventas/mes',
                  '50 productos',
                  'Stock basico',
                  'Dashboard',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://nordia-pos-real.vercel.app/onboarding"
                className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Plan PRO */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                Recomendado
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">PRO</h3>
                <div className="text-4xl font-bold mt-2">$19.900</div>
                <p className="text-orange-100 mt-1">/mes</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Hasta 5 usuarios',
                  'Ventas ilimitadas',
                  'Productos ilimitados',
                  'Offline completo',
                  'AFIP integrado',
                  'Reportes avanzados',
                  'Soporte WhatsApp',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-white flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="https://nordia-pos-real.vercel.app/onboarding"
                className="block w-full text-center bg-white hover:bg-orange-50 text-orange-600 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                Elegir PRO
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8">
            Sin tarjeta. Sin compromiso. Cancelas cuando quieras.
          </p>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Listo para dejar el cuaderno?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Empeza gratis en 30 segundos. Sin tarjeta, sin vueltas.
          </p>
          <Link
            href="https://nordia-pos-real.vercel.app/onboarding"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-orange-600 font-bold text-lg px-10 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Crear mi cuenta gratis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">Nordia POS</span>
            </div>

            <p className="text-sm text-center md:text-left">
              2024 Nordia. Hecho en Corrientes, Argentina.
            </p>

            <div className="flex items-center gap-6">
              <a
                href="https://wa.me/5493794815782"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a
                href="mailto:hola@nordia.uno"
                className="hover:text-white transition-colors"
              >
                hola@nordia.uno
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <a href="#" className="hover:text-white transition-colors">Terminos</a>
            <span className="mx-3"></span>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
