import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

// Configuramos el Gateway. Habilitamos CORS para permitir conexiones del cliente
@WebSocketGateway({
  cors: {
    origin: '*', // En producción, deberíamos restringir esto a la URL del cliente
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  // Obtenemos una instancia del servidor de Socket.IO
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Método para que los clientes se unan a una "sala" específica de subasta.
   * El cliente emitirá un evento 'joinAuction' con el auctionId.
   */
  @SubscribeMessage('joinAuction')
  handleJoinAuction(
    @MessageBody() auctionId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(auctionId);
    this.logger.log(`Cliente ${client.id} se unió a la sala ${auctionId}`);
  }

  /**
   * Método público que nuestro BidsService llamará.
   * Emitirá un evento 'auctionUpdate' a todos los clientes en la sala de esa subasta.
   */
  emitAuctionUpdate(auctionId: string, payload: any) {
    this.server.to(auctionId).emit('auctionUpdate', payload);
    this.logger.log(
      `Emitiendo 'auctionUpdate' a la sala ${auctionId} con payload: ${JSON.stringify(payload)}`,
    );
  }
}