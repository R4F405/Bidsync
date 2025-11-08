import {Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { AuctionStatus } from '@prisma/client';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea una nueva subasta para un artículo.
   * @param userId El ID del usuario (vendedor) que crea la subasta.
   * @param createAuctionDto Datos de la subasta.
   */
  async createAuction(userId: string, createAuctionDto: CreateAuctionDto) {
    const { itemId, startPrice, startTime, endTime, reservePrice, buyNowPrice } =
      createAuctionDto;

    // Verificar que el artículo existe
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found`);
    }

    // Verificar que el usuario que crea la subasta es el dueño del artículo.
    if (item.ownerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to create an auction for this item.',
      );
    }

    // Verificar que este artículo no esté ya en una subasta DRAFT o ACTIVE
    const existingAuction = await this.prisma.auction.findFirst({
      where: {
        itemId: itemId,
        status: {
          in: [AuctionStatus.DRAFT, AuctionStatus.ACTIVE],
        },
      },
    });

    if (existingAuction) {
      throw new ConflictException(
        'This item is already in a DRAFT or ACTIVE auction.',
      );
    }

    // Crear la subasta
    // El estado por defecto es DRAFT
    // Establecemos el currentPrice inicial al startPrice.
    const newAuction = await this.prisma.auction.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        startPrice,
        currentPrice: startPrice,
        reservePrice,
        buyNowPrice,
        status: AuctionStatus.DRAFT,
        itemId,
      },
    });

    return newAuction;
  }
}