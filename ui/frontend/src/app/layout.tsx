import "./globals.css";
import type { Metadata } from "next";
import { BrandProvider } from "../components/brand-provider";

export const metadata: Metadata = {
  title: "Nordia ISP Suite",
  description: "White-label automation dashboard for ISP partners.",
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
