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

        if (!currentHighestBid) {
          // Es la primera puja.
          newCurrentPrice = auction.startPrice;
          newHighestBidderId = userId;
        } else if (maxAmount > currentHighestBid.maxAmount) {
          // El nuevo pujador es el líder.
          const increment =
            currentHighestBid.maxAmount * this.BID_INCREMENT_PERCENTAGE;
          newCurrentPrice = Math.min(
            maxAmount,
            currentHighestBid.maxAmount + increment,
          );
          newHighestBidderId = userId;
        } else {
          // El nuevo pujador NO es el líder.
          const increment = maxAmount * this.BID_INCREMENT_PERCENTAGE;
          newCurrentPrice = Math.min(
            currentHighestBid.maxAmount,
            maxAmount + increment,
          );
          newHighestBidderId = currentHighestBid.bidderId;
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
            `[BID-8] ¡Buy Now alcanzado! Subasta ${auctionId} vendida.`,
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