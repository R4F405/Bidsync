<h1 align="center">Bidsync - Plataforma de Subastas</h1>

<p align="center">
  <a href="https://github.com/R4F405/Bidsync/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" />
  </a>
  <img src="https://img.shields.io/badge/Built%20with-TypeScript-blue.svg?logo=typescript&logoColor=white" alt="Built with: TypeScript" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB.svg?logo=react&logoColor=black" alt="Frontend: React" />
  <img src="https://img.shields.io/badge/Powered%20by-Vite-646CFF.svg?logo=vite&logoColor=white" alt="Powered by: Vite" />
  <a href="https://www.npmjs.com/~nestjscore">
    <img src="https://img.shields.io/npm/v/@nestjs/core.svg?label=NestJS&color=E0234E&logo=nestjs" alt="NestJS Version" />
  </a>
  <img src="https://img.shields.io/badge/ORM-Prisma-2D3748.svg?logo=prisma&logoColor=white" alt="ORM: Prisma" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1.svg?logo=postgresql&logoColor=white" alt="Database: PostgreSQL" >
</p>

Bidsync es una plataforma de subastas en tiempo real diseñada para ser eficiente, escalable y robusta. Este repositorio contiene la implementación completa del proyecto, separada en un backend de API (servidor) y una aplicación web (cliente).

 Este proyecto se basa en el **Documento de Definición del Proyecto (v1.0)**.

## Arquitectura

El sistema sigue un enfoque de **Monolito Modular** para el backend, construido con NestJS , lo que permite una alta cohesión y bajo acoplamiento entre los dominios de negocio (usuarios, subastas, pujas, etc.)

* `/server`: API de NestJS que maneja toda la lógica de negocio, autenticación y comunicación con la base de datos.
* `/client`: Aplicación de Página Única (SPA) construida con React que consume la API del servidor.

## Características Principales

 La plataforma implementa un modelo de **Subasta Inglesa** con las siguientes características clave:

*  **Pujas por Poder (Proxy Bidding)**: Los usuarios establecen su puja máxima y el sistema puja automáticamente por ellos.
*  **Anti-Sniping (Cierre Suave)**: Extiende automáticamente el tiempo de finalización si se recibe una puja en los últimos minutos.
*  **Precio de Reserva**: Los vendedores pueden establecer un precio mínimo oculto para sus artículos.
* **¡Cómpralo Ya! (Buy Now) **: Opción para comprar un artículo inmediatamente a un precio fijo, disponible hasta la primera puja.
* **Flujo de Pagos (Escrow)**: Un sistema de transacciones seguro donde la plataforma retiene el pago hasta que el comprador confirma la recepción.
*  **Autenticación JWT**: Gestión de usuarios segura mediante JSON Web Tokens.

## Stack Tecnológico

 El stack tecnológico se alinea con las definiciones del proyecto.

| Categoría | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Backend** |  NestJS (Node.js)  |  Framework TypeScript robusto para una arquitectura modular. |
| **Frontend** |  React (con TypeScript)  |  UI moderna y tipada. |
| **Build Tool (FE)** |  Vite  |  Entorno de desarrollo ultrarrápido. |
| **Base de Datos** |  PostgreSQL  |  Base de datos relacional ACID fiable. |
| **ORM** |  Prisma  |  ORM con seguridad de tipos end-to-end. |
| **Autenticación** |  JWT (JSON Web Tokens)  |  Estándar para APIs stateless consumidas por SPAs. |
| **Tiempo Real** |  WebSockets (vía NestJS Gateways)  |  Esencial para pujas en tiempo real. |

## Puesta en Marcha (Desarrollo Local)

Sigue estos pasos para levantar el entorno de desarrollo completo.

### 1. Requisitos Previos

* Node.js (v20+ recomendado)
* npm (o pnpm/yarn)
* Una instancia de PostgreSQL en ejecución.

### 2. Configurar el Servidor (API)

1.  Navega al directorio del servidor:
    ```bash
    cd server
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea tu archivo de entorno a partir del ejemplo:
    ```bash
    cp .env.example .env
    ```
4.  Edita el archivo `.env` y configura tus variables:
    * `DATABASE_URL`: La cadena de conexión a tu base de datos PostgreSQL. (Ej: `"postgresql://user:password@localhost:5432/bidsync?schema=public"`)
    * `JWT_SECRET`: Una cadena aleatoria segura para firmar los tokens.
5.  Aplica las migraciones de la base de datos (esto creará las tablas):
    ```bash
    npx prisma migrate dev
    ```
6.  Inicia el servidor en modo *watch*:
    ```bash
    npm run start:dev
    ```
    La API estará disponible en `http://localhost:3000` (o el puerto definido en `.env`).

### 3. Configurar el Cliente (React App)

1.  Abre una **nueva terminal** y navega al directorio del cliente:
    ```bash
    cd client
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo de Vite:
    ```bash
    npm run dev
    ```
    La aplicación web estará disponible en `http://localhost:5173`.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para discutir cambios importantes.

## Licencia

Este proyecto está bajo la Licencia MIT.