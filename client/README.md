<h1 align="center">Bidsync Cliente (Frontend)</h1>

Esta es la aplicación cliente (frontend) de Bidsync, responsable de la interfaz de usuario.

Consume la **API del Servidor Bidsync** (ubicada en el directorio `/server`) para obtener datos, gestionar la autenticación y enviar pujas en tiempo real.

## Stack Tecnológico

* **Framework**: React 19
* **Lenguaje**: TypeScript
* **Build Tool**: Vite
* **Peticiones HTTP**: Axios

## Configuración del Proyecto

1.  Navega al directorio del cliente:
    ```bash
    cd client
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## Scripts Disponibles

* `npm run dev`: Inicia el servidor de desarrollo de Vite (disponible en `http://localhost:5173`).
* `npm run build`: Genera una versión de producción optimizada en el directorio `dist`.
* `npm run preview`: Previsualiza la versión de producción localmente.
* `npm run lint`: Ejecuta el linter de ESLint.