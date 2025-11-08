<h1 align="center">Bidsync API (Servidor)</h1>

Este directorio contiene el servidor API para la plataforma Bidsync, construido con **NestJS**.

 sta API sigue un patrón de **Monolito Modular**  y es responsable de gestionar toda la lógica de negocio, la autenticación de usuarios, el procesamiento de pujas en tiempo real y la persistencia de datos con PostgreSQL a través de Prisma.

## Módulos Principales

La arquitectura se divide en los siguientes dominios de negocio:

* `AppModule` (Raíz)
* `PrismaModule` (Gestión de conexión a BD)
* `AuthModule` (Autenticación y JWT)
* `UsersModule` (Gestión de usuarios)
* `ItemsModule` (Gestión de artículos)
* `AuctionsModule` (Gestión de subastas)
* `BidsModule` (Gestión de pujas y Proxy Bidding)
* `TransactionsModule` (Gestión de pagos y Escrow)

## Configuración y Puesta en Marcha

1.  **Instalar dependencias**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno**
    Crea un archivo `.env` basándote en el `.env.example`. Deberás proporcionar:
    * `DATABASE_URL`: Cadena de conexión a tu base de datos PostgreSQL.
    * `JWT_SECRET`: Clave secreta para firmar los JSON Web Tokens.

3.  **Ejecutar migraciones de la Base de Datos**
    Prisma gestionará el esquema de la base de datos. Ejecuta el siguiente comando para crear las tablas definidas en `prisma/schema.prisma`:
    ```bash
    npx prisma migrate dev
    ```

4.  **Iniciar el servidor de desarrollo**
    ```bash
    npm run start:dev
    ```
    La API se ejecutará en `http://localhost:3000` (o el puerto especificado en `.env`).

## Scripts Disponibles

* `npm run start:dev`: Inicia el servidor en modo desarrollo con recarga automática.
* `npm run start:prod`: Inicia el servidor en modo producción (requiere `npm run build` previo).
* `npm run build`: Compila el proyecto TypeScript a JavaScript.
* `npm run test`: Ejecuta las pruebas unitarias.
* `npm run test:e2e`: Ejecuta las pruebas end-to-end.
* `npm run test:cov`: Genera el reporte de cobertura de pruebas.