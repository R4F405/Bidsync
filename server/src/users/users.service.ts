import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  /**
   * Busca un usuario por su email.
   * @param email El email del usuario a buscar.
   * @returns El usuario o null si no se encuentra.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Crea un nuevo usuario.
   * Hashea la contraseña antes de guardarla.
   * @param data Datos del usuario (email y contraseña).
   * @returns El usuario creado.
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.passwordHash, saltRounds);

    return this.prisma.user.create({
      data: {
        ...data,
        passwordHash: hashedPassword,
      },
    });
  }

  /**
   * Obtiene los items creados por un usuario.
   */
  async getUserItems(userId: string) {
    return this.prisma.item.findMany({
      where: { ownerId: userId },
      include: {
        images: true,
        auctions: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Obtiene las pujas realizadas por un usuario.
   */
  async getUserBids(userId: string) {
    return this.prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        auction: {
          include: {
            item: {
              include: { images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene las subastas ganadas por un usuario.
   */
  async getUserWonAuctions(userId: string) {
    return this.prisma.auction.findMany({
      where: { highestBidderId: userId, status: 'ENDED' }, // Asumiendo que ENDED es el estado final
      include: {
        item: {
          include: { images: true },
        },
        transaction: true,
      },
    });
  }
}