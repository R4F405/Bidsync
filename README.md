<h1 align="center">Bidsync - Plataforma de Subastas</h1>

<p align="center">
  <a href="https://github.com/R4F405/Bidsync/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/Built%20with-TypeScript-blue.svg?logo=typescript&logoColor=white" alt="Built with: TypeScript" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB.svg?logo=react&logoColor=black" alt="Frontend: React" />
  <img src="https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC.svg?logo=tailwind-css&logoColor=white" alt="Style: Tailwind CSS" />
  <img src="https://img.shields.io/badge/Powered%20by-Vite-646CFF.svg?logo=vite&logoColor=white" alt="Powered by: Vite" />
  <a href="https://www.npmjs.com/~nestjscore">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg?label=NestJS&color=E0234E&logo=nestjs" alt="NestJS Version" />
  </a>
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748.svg?logo=prisma&logoColor=white" alt="ORM: Prisma" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1.svg?logo=postgresql&logoColor=white" alt="Database: PostgreSQL" >
  <a href="https://deepwiki.com/R4F405/Bidsync"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

Bidsync es una plataforma de subastas en tiempo real diseñada para ser eficiente, escalable y robusta. Este repositorio contiene la implementación completa del proyecto, separada en un backend de API (servidor) y una aplicación web (cliente).

## Arquitectura

El sistema sigue un enfoque de **Monolito Modular** para el backend, construido con NestJS, lo que permite una alta cohesión y bajo acoplamiento entre los dominios de negocio (usuarios, subastas, pujas, etc.)

* `/server`: API de NestJS que maneja toda la lógica de negocio, autenticación y comunicación con la base de datos.
* `/client`: Aplicación de Página Única (SPA) construida con React que consume la API del servidor.

## Estructura del Proyecto

El proyecto está organizado en dos directorios principales dentro de un monorepo:

### 📂 client (Frontend)
La aplicación React está estructurada de la siguiente manera en `src/`:

*   `assets`: Recursos estáticos como imágenes y estilos globales.
*   `components`: Componentes de UI reutilizables (Navbar, Cards, Modales).
*   `context`: Contextos de React para gestión de estado global (ej. AuthContext).
*   `hooks`: Hooks personalizados para lógica compartida.
*   `pages`: Componentes de página que representan las vistas principales (Home, Dashboard, Login).
*   `router`: Configuración de rutas de la aplicación.
*   `services`: Módulos para la comunicación con la API del backend.
*   `types`: Definiciones de tipos TypeScript compartidos.

### 📂 server (Backend)
La API NestJS sigue una arquitectura modular en `src/`:

*   `auctions`: Módulo de gestión de subastas.
*   `auth`: Módulo de autenticación y guardias JWT.
*   `bids`: Lógica para la gestión de pujas.
*   `events`: Gateway de WebSockets para eventos en tiempo real.
*   `items`: Gestión de artículos e inventario.
*   `prisma`: Servicio de conexión con la base de datos y ORM.
*   `transactions`: Gestión del flujo de pagos y estados de envío.
*   `users`: Gestión de perfiles de usuario y datos relacionados.

## Características Principales

La plataforma implementa un modelo de **Subasta Inglesa** con las siguientes características clave:

* **Experiencia de Usuario Moderna**: Interfaz visual completamente renovada utilizando **Tailwind CSS**, con un diseño limpio y responsivo inspirado en plataformas líderes como Wallapop.
* **Dashboard de Usuario**: Panel de control centralizado donde los usuarios pueden gestionar:
    * **Mis Artículos**: Ver y gestionar los productos puestos en subasta.
    * **Mis Pujas**: Seguimiento de las subastas en las que se está participando.
    * **Subastas Ganadas**: Gestión de los artículos ganados y su estado de transacción.
* **Flujo de Transacción**: Sistema completo de estados para artículos ganados (Pendiente de Pago -> Enviado -> Entregado).
* **Pujas por Poder (Proxy Bidding)**: Los usuarios establecen su puja máxima y el sistema puja automáticamente por ellos.
* **Anti-Sniping (Cierre Suave)**: Extiende automáticamente el tiempo de finalización si se recibe una puja en los últimos minutos.
* **Precio de Reserva**: Los vendedores pueden establecer un precio mínimo oculto para sus artículos.
* **¡Cómpralo Ya! (Buy Now)**: Opción para comprar un artículo inmediatamente a un precio fijo.
* **Autenticación JWT**: Gestión de usuarios segura mediante JSON Web Tokens.

## Stack Tecnológico

El stack tecnológico se alinea con las definiciones del proyecto.

| Categoría | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Backend** | NestJS (Node.js) | Framework TypeScript robusto para una arquitectura modular. |
| **Frontend** | React (con TypeScript) | UI moderna y tipada. |
| **Estilos** | Tailwind CSS | Framework de utilidad para un diseño rápido y consistente. |
| **Build Tool (FE)** | Vite | Entorno de desarrollo ultrarrápido. |
| **Base de Datos** | PostgreSQL | Base de datos relacional ACID fiable. |
| **ORM** | Prisma | ORM con seguridad de tipos end-to-end. |
| **Autenticación** | JWT (JSON Web Tokens) | Estándar para APIs stateless consumidas por SPAs. |
| **Tiempo Real** | WebSockets (vía NestJS Gateways) | Esencial para pujas en tiempo real. |

## Puesta en Marcha (Desarrollo Local)

Este proyecto incluye comandos personalizados para facilitar la configuración y ejecución del entorno de desarrollo.

### 1. Requisitos Previos

* Node.js (v20+ recomendado)
* npm (o pnpm/yarn)
* Una instancia de PostgreSQL en ejecución.

### 2. Instalación y Configuración

1.  **Instalar todas las dependencias**:
    Ejecuta el siguiente comando en la raíz del proyecto para instalar las dependencias de la raíz, del cliente y del servidor automáticamente:
    ```bash
    npm run install:all
    ```

2.  **Configurar el Servidor (Base de Datos)**:
    *   Navega a la carpeta del servidor: `cd server`
    *   Crea tu archivo `.env`: `cp .env.example .env`
    *   Edita `.env` con tus credenciales de base de datos (`DATABASE_URL`) y `JWT_SECRET`.
    *   Ejecuta las migraciones:
        ```bash
        npx prisma migrate dev
        ```
    *   Vuelve a la raíz: `cd ..`

### 3. Ejecutar la Aplicación

Para iniciar el entorno de desarrollo completo (Cliente + Servidor) con un solo comando:

```bash
npm run dev
```

Este comando utiliza `concurrently` para levantar simultáneamente:
*   **Backend (API)**: `http://localhost:3000`
*   **Frontend (Web)**: `http://localhost:5173`

### Comandos Útiles

*   `npm run install:all`: Instala dependencias en raíz, cliente y servidor.
*   `npm run dev`: Inicia cliente y servidor en modo desarrollo.
*   `npm run build`: Construye cliente y servidor para producción.
*   `npm run lint`: Ejecuta el linter en ambos proyectos.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios importantes.

## Licencia

Este proyecto está bajo la Licencia MIT.
