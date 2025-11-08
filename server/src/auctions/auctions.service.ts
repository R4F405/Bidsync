import {Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { AuctionStatus } from '@prisma/client';
import { UpdateAuctionStatusDto } from './dto/update-auction-status.dto';

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

  /**
   * Actualiza el estado de una subasta (ej. DRAFT -> ACTIVE).
   * @param auctionId El ID de la subasta a actualizar.
   * @param userId El ID del usuario que realiza la solicitud.
   * @param newStatus El nuevo estado deseado.
   */
  async updateAuctionStatus(
    auctionId: string,
    userId: string,
    newStatus: AuctionStatus,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          item: {
            select: { ownerId: true },
          },
        },
      });

      if (!auction) {
        throw new NotFoundException(`Auction with ID "${auctionId}" not found.`);
      }

      if (auction.item.ownerId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to modify this auction.',
        );
      }

      // Solo permite "publicar" (DRAFT -> ACTIVE) o "cancelar" (DRAFT -> CANCELLED)
      if (auction.status !== AuctionStatus.DRAFT) {
        throw new BadRequestException(
          `Auction can only be updated from DRAFT status. Current status: ${auction.status}`,
        );
      }

      if (newStatus !== AuctionStatus.ACTIVE && newStatus !== AuctionStatus.CANCELLED) {
        throw new BadRequestException(
          `From DRAFT, status can only be updated to ACTIVE or CANCELLED.`,
        );
      }

      // 5. Realizar la actualización
      return tx.auction.update({
        where: { id: auctionId },
        data: {
          status: newStatus,
        },
      });
    });
  }
}