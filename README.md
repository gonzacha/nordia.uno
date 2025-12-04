# Nordia · Inteligencia Situacional Aplicada

Sitio web en Next.js para el estudio de inteligencia situacional de Nordia. Comunica servicios y casos de diseño de sistemas, procesos y automatizaciones con IA para pymes y equipos operativos.

## Stack
- Next.js (App Router) con TypeScript
- Tailwind CSS para estilos
- Deploy en Vercel (`nordia-uno.vercel.app`)

## Desarrollo local
```bash
npm install
npm run dev
```

## Calidad y build
```bash
npm run lint
npm run build
```

## Estructura breve
- `src/app/` – páginas y layouts globales
- `src/components/` – componentes compartidos y contexto de marca
- `public/` – assets estáticos y temas de marca

## Deploy
Los deployments a producción se realizan desde la rama `main` hacia Vercel.
