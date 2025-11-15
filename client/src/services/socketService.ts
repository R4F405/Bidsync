import { io, Socket } from 'socket.io-client';

// La URL de nuestro Gateway de NestJS
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // No nos conectamos automáticamente al cargar la web
  transports: ['websocket'], // Forzamos WebSockets
});