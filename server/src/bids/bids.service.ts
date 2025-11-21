import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuctionStatus, Auction, Bid, Item, Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class BidsService {
  private readonly BID_INCREMENT_PERCENTAGE = 0.05;
  private readonly ANTI_SNIPING_WINDOW_MS = 3 * 60 * 1000;
  private readonly logger = new Logger(BidsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Coloca una puja (maxAmount) en una subasta.
   * Maneja la lógica de Proxy Bidding, Anti-Sniping y Buy Now.
   * Emite actualizaciones vía WebSocket.
   *
   * - Utiliza una transacción interactiva con bloqueo pesimista (FOR UPDATE) para prevenir condiciones de carrera.
   * - Optimiza la consulta para obtener solo la puja más alta, no todas.
   */
  async placeBid(userId: string, createBidDto: CreateBidDto) {
    const { auctionId, maxAmount } = createBidDto;

    // Usamos una transacción interactiva ($transaction) que nos permite ejecutar lógica y consultas dependientes.
    return this.prisma.$transaction(
      async (tx) => {
        // Bloqueo Pesimista:
        // Bloqueamos la fila de la subasta para esta transacción.
        // Cualquier otra llamada a `placeBid` para ESTA subasta esperará aquí hasta que esta transacción termine (commit o rollback).
        // Usamos $queryRaw porque findUnique/findFirst no soportan `FOR UPDATE`.
        const [auction] = await tx.$queryRaw<Auction[]>(
          Prisma.sql`SELECT * FROM "Auction" WHERE id = ${auctionId} FOR UPDATE`,
        );

        // Si no hay subasta, `auction` será undefined.
        if (!auction) {
          throw new NotFoundException(`Auction not found.`);
        }

        // Obtenemos el 'item' por separado, ya que $queryRaw no puede hacer 'include'.
        // Lo necesitamos para la validación del propietario.
        const item = await tx.item.findUnique({
          where: { id: auction.itemId },
          select: { ownerId: true },
        });

        if (!item) {
          throw new NotFoundException(
            `Item associated with auction ${auctionId} not found.`,
          );
        }

        // Ejecutamos la validación DESPUÉS de obtener el bloqueo.
        // Esto previene que validemos datos "antiguos" (ej. un estado, precio o
        // endTime que estén a punto de ser modificados por otra transacción).
        this.validateBid({ ...auction, item }, userId, maxAmount);

        const now = new Date();

        // Obtenemos SÓLO la puja más alta actual, en lugar de cargar todas las pujas de la subasta en memoria.
        const currentHighestBid = await tx.bid.findFirst({
          where: { auctionId: auction.id },
          orderBy: { maxAmount: 'desc' },
        });

        // Desactivar "Buy Now" si es la primera puja
        let newBuyNowPrice: number | null = auction.buyNowPrice;
        if (!currentHighestBid && auction.buyNowPrice) {
          this.logger.log(
            `Primera puja recibida. Desactivando Buy Now para subasta ${auctionId}.`,
          );
          newBuyNowPrice = null; // Desactiva "Cómpralo Ya"
        }

        // Proxy Bidding
        let newCurrentPrice = auction.currentPrice;
        let newHighestBidderId = auction.highestBidderId;

        // Es la primera puja
        if (!currentHighestBid) {
          newCurrentPrice = auction.startPrice;
          newHighestBidderId = userId;
        } 
        
        // El pujador actual YA ES el pujador más alto
        else if (currentHighestBid.bidderId === userId) {
          
          // El usuario está aumentando su puja máxima
          if (maxAmount > currentHighestBid.maxAmount) {
            newHighestBidderId = userId;
            this.logger.log(`Usuario ${userId} aumentó su puja máxima a ${maxAmount}. El precio no cambia.`);
            // NO CAMBIAMOS newCurrentPrice
          } 
          
          // El usuario puja MENOS que su máximo actual (raro, pero se maneja)
          else if (maxAmount < currentHighestBid.maxAmount) { 
            const increment = maxAmount * this.BID_INCREMENT_PERCENTAGE;
            newCurrentPrice = Math.min(
              currentHighestBid.maxAmount,
              maxAmount + increment,
            );
            newHighestBidderId = currentHighestBid.bidderId; // Sigue siendo él
          }

          // El usuario puja EXACTAMENTE su máximo
          else {
            this.logger.log(`Usuario ${userId} volvió a pujar su máximo ${maxAmount}. Sin cambios.`);
            newHighestBidderId = userId; // Nos aseguramos de que sigue siendo el líder
            // NO CAMBIAMOS newCurrentPrice
          }
        }
        // Es un nuevo pujador o un pujador antiguo superando al líder
        else if (maxAmount > currentHighestBid.maxAmount) {
          // El nuevo pujador es el líder.
          // El precio sube a la puja máxima anterior + incremento
          const increment = currentHighestBid.maxAmount * this.BID_INCREMENT_PERCENTAGE;
          newCurrentPrice = Math.min(
            maxAmount, // No puede superar el maxAmount del nuevo pujador
            currentHighestBid.maxAmount + increment,
          );
          newHighestBidderId = userId;
        } 
        // La puja no es suficiente para ser el líder
        else {
          // El nuevo pujador NO es el líder.
          // El precio sube a la puja del nuevo pujador + incremento
          const increment = maxAmount * this.BID_INCREMENT_PERCENTAGE;
          newCurrentPrice = Math.min(
            currentHighestBid.maxAmount, // No puede superar el maxAmount del líder
            maxAmount + increment,
          );
          newHighestBidderId = currentHighestBid.bidderId; // El líder se mantiene
        }

        // Variables de estado por defecto
        let newStatus = auction.status;
        let newEndTime = new Date(auction.endTime);

        // Lógica de "Buy Now"
        if (
          auction.buyNowPrice &&
          newCurrentPrice >= auction.buyNowPrice &&
          auction.status === AuctionStatus.ACTIVE
        ) {
          this.logger.log(
            `¡Buy Now alcanzado! Subasta ${auctionId} vendida.`,
          );
          newCurrentPrice = auction.buyNowPrice;
          newHighestBidderId = userId; // El pujador que activó el Buy Now gana
          newStatus = AuctionStatus.SOLD; // Finaliza la subasta
          newEndTime = now; // La subasta termina ahora
          newBuyNowPrice = null; // Desactiva por si acaso
        }
        // Lógica de Anti-Sniping
        else if (newStatus === AuctionStatus.ACTIVE) {
          const timeRemaining = newEndTime.getTime() - now.getTime();
          if (timeRemaining < this.ANTI_SNIPING_WINDOW_MS) {
            this.logger.log(
              `Anti-Sniping activado. Extendiendo tiempo para subasta ${auctionId}.`,
            );
            newEndTime = new Date(now.getTime() + this.ANTI_SNIPING_WINDOW_MS);
          }
        }

        // Crear la nueva puja
        const newBid = await tx.bid.create({
          data: {
            auctionId,
            bidderId: userId,
            maxAmount,
          },
        });

        // Actualizar la subasta
        const updatedAuction = await tx.auction.update({
          where: { id: auctionId },
          data: {
            currentPrice: newCurrentPrice,
            highestBidderId: newHighestBidderId,
            status: newStatus,
            endTime: newEndTime,
            buyNowPrice: newBuyNowPrice,
          },
        });

        // Emitir actualización por WebSocket
        this.eventsGateway.emitAuctionUpdate(auctionId, {
          currentPrice: updatedAuction.currentPrice,
          highestBidderId: updatedAuction.highestBidderId,
          endTime: updatedAuction.endTime,
          status: updatedAuction.status,
        });

        return { newBid, updatedAuction };
      },
      {
        // Aumentamos el tiempo de espera de la transacción
        // para manejar pujas en cola.
        timeout: 10000, 
      },
    );
  }

  /**
   * Encuentra la puja máxima actual de un usuario específico para una subasta.
   * @param userId El ID del usuario que pregunta.
   * @param auctionId El ID de la subasta en cuestión.
   * @returns La puja más alta del usuario (o null si no ha pujado).
   */
  async findUserMaxBid(userId: string, auctionId: string) {
    // Buscamos la puja MÁS ALTA (maxAmount) de este usuario en esta subasta específica.
    return this.prisma.bid.findFirst({
      where: {
        bidderId: userId,
        auctionId: auctionId,
      },
      orderBy: {
        maxAmount: 'desc',
      },
    });
  }

  /**
   * Helper privado para validar la puja.
   * Lanza excepciones si la puja no es válida.
   *
   * La firma de entrada ahora espera el 'item' como un objeto separado, ya que no podemos usar 'include' con '$queryRaw'.
   */
  private validateBid(
    auction: Auction & { item: { ownerId: string } },
    userId: string,
    maxAmount: number,
  ) {

    if (auction.item.ownerId === userId) {
      throw new ForbiddenException('You cannot bid on your own auction.');
    }
    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException(
        'Bids can only be placed on ACTIVE auctions.',
      );
    }
    if (new Date() > new Date(auction.endTime)) {
      throw new BadRequestException('This auction has already ended.');
    }
    if (maxAmount <= auction.currentPrice) {
      throw new BadRequestException(
        `Your bid must be higher than the current price (${auction.currentPrice}).`,
      );
    }
  }
}