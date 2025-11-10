import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Auction, Item, TransactionStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

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
    auction: Auction,
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
}