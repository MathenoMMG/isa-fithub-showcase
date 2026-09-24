# Working Logbook - ISA FitHub Showcase

## Esquema Completo Actual
- **Proyecto:** FitHub Manager / ISA FitHub Showcase
- **Stack:** React 19, Vite 7, TailwindCSS v4, TanStack Router & Query, Lucide Icons, Radix UI.
- **Configuración de Despliegue:** `netlify.toml` configurado para `npm run build` con carpeta de salida `dist` y redirecciones SPA.

## Qué hay
- Código del showcase de FitHub completamente desacoplado de bases de datos externas: usa base de datos mock determinista y reactiva en memoria con persistencia en localStorage.
- Todas las credenciales, llaves API y correos personales sanitizados (no hay `.env`, no hay leaks de Supabase ni correos personales).
- Despliegue en producción completado en Netlify en un proyecto totalmente independiente: [isa-fithub-showcase.netlify.app](https://isa-fithub-showcase.netlify.app).
- El proyecto original en producción ([isa-fithub.netlify.app](https://isa-fithub.netlify.app)) fue restaurado a su código de producción original intacto.
- Repositorio git: el código de este showcase solo reside y se sincroniza en `MathenoMMG/isa-fithub-showcase`.

## Qué hace falta
- Ninguna tarea técnica pendiente para este despliegue.

## Qué está fallando
- Ningún fallo detectado. Despliegue en estado `ready`.
