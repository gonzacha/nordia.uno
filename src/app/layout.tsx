import "./globals.css";
import type { Metadata } from "next";
import { BrandProvider } from "../components/brand-provider";

const title = "Nordia · Inteligencia Situacional";
const description =
  "Nordia es un estudio de Inteligencia Situacional Aplicada. Diseñamos sistemas, procesos y automatizaciones con IA para que pymes y equipos operativos trabajen con más orden, claridad y resultados.";

export const metadata: Metadata = {
  title,
  description,
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-brand-gradient bg-fixed text-slate-50">
        <BrandProvider>
          <div className="min-h-screen backdrop-blur-xl bg-slate-950/70">
            {children}
          </div>
        </BrandProvider>
      </body>
    </html>
  );
}
