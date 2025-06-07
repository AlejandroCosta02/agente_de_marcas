# Agente de Marcas - Sistema de Gestión

Sistema de gestión para agentes de marcas en Argentina, desarrollado con Next.js, Tailwind CSS y Neon Database.

## Características

- Autenticación de usuarios (registro e inicio de sesión)
- Dashboard para gestión de marcas
- Interfaz moderna y responsive
- Base de datos PostgreSQL alojada en Neon

## Requisitos

- Node.js 18.0.0 o superior
- NPM 8.0.0 o superior
- Cuenta en Neon Database (https://neon.tech)

## Configuración

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd agente_de_marcas
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env.local` con las siguientes variables:
```
NEON_DATABASE_URL=your_neon_database_url
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret # Generar con: openssl rand -base64 32
```

4. Ejecutar las migraciones:
- Copiar el contenido de `schema.sql`
- Ejecutarlo en tu base de datos Neon

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
src/
  ├── app/                 # App Router de Next.js
  │   ├── api/            # API Routes
  │   ├── auth/           # Páginas de autenticación
  │   └── dashboard/      # Dashboard y gestión de marcas
  ├── components/         # Componentes React
  └── lib/               # Utilidades y configuraciones
```

## Tecnologías Utilizadas

- Next.js 14
- Tailwind CSS
- NextAuth.js
- Neon Database (PostgreSQL)
- TypeScript

## Desarrollo

Para contribuir al proyecto:

1. Crear una rama para tu feature:
```bash
git checkout -b feature/nombre-feature
```

2. Realizar cambios y commits:
```bash
git add .
git commit -m "Descripción del cambio"
```

3. Enviar cambios al repositorio:
```bash
git push origin feature/nombre-feature
```

## Licencia

MIT
