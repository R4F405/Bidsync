import {Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { AuctionStatus } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Coloca una puja (maxAmount) en una subasta.
   * Maneja la lógica de Proxy Bidding.
   */
  async placeBid(userId: string, createBidDto: CreateBidDto) {
    const { auctionId, maxAmount } = createBidDto;

    // La lógica de incremento (ej. 5%) se define aquí
    const BID_INCREMENT_PERCENTAGE = 0.05; // 5%

    return this.prisma.$transaction(async (tx) => {
      // Obtener la subasta y su puja más alta actual
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { maxAmount: 'desc' },
            take: 1,
          },
          item: true,
        },
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID "${auctionId}" not found.`);
      }
      if (auction.item.ownerId === userId) {
        throw new ForbiddenException('You cannot bid on your own auction.');
      }
      if (auction.status !== AuctionStatus.ACTIVE) {
        throw new BadRequestException('Bids can only be placed on ACTIVE auctions.');
      }
      if (new Date() > new Date(auction.endTime)) {
        throw new BadRequestException('This auction has already ended.');
      }
      if (maxAmount <= auction.currentPrice) {
        throw new BadRequestException(
          `Your bid must be higher than the current price (${auction.currentPrice}).`,
        );
      }

      const currentHighestBid = auction.bids[0];
      let newCurrentPrice = auction.currentPrice;
      let newHighestBidderId = auction.highestBidderId;

      // Crear la nueva puja
      const newBid = await tx.bid.create({
        data: {
          auctionId,
          bidderId: userId,
          maxAmount,
        },
      });

      // --- LÓGICA DE PROXY BIDDING ---
      if (!currentHighestBid) {
        // Esta es la primera puja.
        // El precio actual sube al startPrice o se mantiene si el maxAmount es bajo
        newCurrentPrice = auction.startPrice;
        newHighestBidderId = userId;
      } else if (maxAmount > currentHighestBid.maxAmount) {
        // El nuevo pujador es el líder.
        // El precio actual sube a la puja máxima *anterior* + incremento.
        const increment = currentHighestBid.maxAmount * BID_INCREMENT_PERCENTAGE;
        // El nuevo precio es el MÁXIMO del pujador anterior + incremento, pero NUNCA superior al maxAmount del nuevo pujador.
        newCurrentPrice = Math.min(
          maxAmount,
          currentHighestBid.maxAmount + increment,
        );
        newHighestBidderId = userId;
      } else {
        // El nuevo pujador NO es el líder.
        // El líder actual (currentHighestBid) sigue ganando.
        // El precio actual sube a la puja máxima *nueva* + incremento.
        const increment = maxAmount * BID_INCREMENT_PERCENTAGE;
        newCurrentPrice = Math.min(
          currentHighestBid.maxAmount, // El líder sigue ganando, su límite es el tope
          maxAmount + increment,
        );
        newHighestBidderId = currentHighestBid.bidderId; // El líder anterior se mantiene
      }

      // Asegurarnos de que el precio actual no supere el 'buyNowPrice' si existe
      if (auction.buyNowPrice && newCurrentPrice >= auction.buyNowPrice) {
        newCurrentPrice = auction.buyNowPrice;
        // Aquí también deberíamos finalizar la subasta (lo haremos luego)
      }

      // Actualizar la subasta con el nuevo precio y el (posiblemente) nuevo líder
      const updatedAuction = await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentPrice: newCurrentPrice,
          highestBidderId: newHighestBidderId,
        },
      });

      return { newBid, updatedAuction };
    });
  }
}