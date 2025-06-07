# Agente de Marcas

Sistema de gestión para agentes de marcas en Argentina. Una aplicación web moderna construida con Next.js, TypeScript, y Tailwind CSS.

## Características

- Gestión de marcas comerciales
- Seguimiento de trámites
- Notificaciones de vencimientos
- Panel de control intuitivo
- Autenticación segura
- Base de datos PostgreSQL

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- NextAuth.js
- Vercel Postgres
- Framer Motion

## Desarrollo Local

1. Clonar el repositorio:
```bash
git clone https://github.com/your-username/agente_de_marcas.git
cd agente_de_marcas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env.local` y agregar las siguientes variables:
```
POSTGRES_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Licencia

MIT
