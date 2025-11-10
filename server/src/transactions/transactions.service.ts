import {Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Transaction, TransactionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

type TransactionRole = 'buyer' | 'seller';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Crea una transacción PENDING_PAYMENT cuando una subasta se marca como SOLD.
   * Este método está diseñado para ser llamado DESDE DENTRO de una transacción de Prisma existente.
   *
   * @param tx El cliente de transacción de Prisma (Prisma.TransactionClient).
   * @param auction La subasta que finalizó.
   * @param itemOwnerId El ID del vendedor (dueño del item).
   * @param buyerId El ID del comprador (highestBidderId).
   */
  async createTransactionForSoldAuction(
    tx: Omit<
      PrismaService,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
    auction: { id: string; currentPrice: number },
    itemOwnerId: string,
    buyerId: string,
  ) {
    return tx.transaction.create({
      data: {
        amount: auction.currentPrice,
        status: TransactionStatus.PENDING_PAYMENT,
        auctionId: auction.id,
        buyerId: buyerId,
        sellerId: itemOwnerId,
      },
    });
  }

  /**
   * El Comprador paga la transacción, moviéndola a IN_ESCROW.
   */
  async payForTransaction(transactionId: string, userId: string) {
    return this.updateTransactionStatus(
      transactionId,
      userId,
      'buyer',
      TransactionStatus.PENDING_PAYMENT,
      TransactionStatus.IN_ESCROW,
    );
  }

  /**
   * El Vendedor envía el artículo, moviendo la transacción a SHIPPED.
   */
  async shipItem(transactionId: string, userId: string) {
    return this.updateTransactionStatus(
      transactionId,
      userId,
      'seller', // Solo el vendedor puede enviar
      TransactionStatus.IN_ESCROW,
      TransactionStatus.SHIPPED,
    );
  }

  /**
   * El Comprador confirma la recepción, moviendo la transacción a COMPLETED.
   */
  async confirmReceipt(transactionId: string, userId: string) {
    return this.updateTransactionStatus(
      transactionId,
      userId,
      'buyer', // Solo el comprador puede confirmar
      TransactionStatus.SHIPPED,
      TransactionStatus.COMPLETED,
    );
  }

  /**
   * Helper reutilizable para actualizar el estado de una transacción.
   * Valida permisos, estado actual y actualiza a un nuevo estado.
   * Emite un evento WebSocket al finalizar.
   */
  private async updateTransactionStatus(
    transactionId: string,
    userId: string,
    role: TransactionRole,
    expectedStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    // Validar que la transacción existe
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID "${transactionId}" not found.`,
      );
    }

    // Validar permisos de usuario (Rol)
    const roleUserId =
      role === 'buyer' ? transaction.buyerId : transaction.sellerId;
    if (roleUserId !== userId) {
      throw new ForbiddenException(
        `You are not authorized to perform this action. Expected ${role}.`,
      );
    }

    // Validar estado actual
    if (transaction.status !== expectedStatus) {
      throw new BadRequestException(
        `Invalid transaction state. Expected ${expectedStatus} but got ${transaction.status}.`,
      );
    }

    // Actualizar el estado
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: newStatus,
      },
    });

    // Emitir notificación por WebSocket
    const roomName = `transaction:${transactionId}`;
    this.eventsGateway.emitAuctionUpdate(roomName, {
      transactionId: updatedTransaction.id,
      status: updatedTransaction.status,
    });
    this.logger.log(
      `[BID-10] Transacción ${transactionId} actualizada a ${newStatus}. Emitiendo a la sala ${roomName}.`,
    );

    return updatedTransaction;
  }
}