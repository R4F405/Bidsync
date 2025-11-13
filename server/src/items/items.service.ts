import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo artículo y sus imágenes asociadas.
   * @param ownerId El ID del usuario autenticado (dueño)
   * @param createItemDto Los datos del artículo (título, descripción)
   * @param images Un array de URLs generadas localmente por Multer
   * @returns El artículo creado con sus imágenes.
   */
  async createItem(
    ownerId: string,
    createItemDto: CreateItemDto,
    imageUrls: string[],
  ) {
    const { title, description } = createItemDto;

    // Usamos una transacción de Prisma para asegurar que o se crea el artículo y las imágenes, o no se crea nada.
    const newItem = await this.prisma.$transaction(async (tx) => {
      // Crear el artículo
      const item = await tx.item.create({
        data: {
          title,
          description,
          ownerId,
        },
      });

      // Si se proveyeron imágenes, crearlas y vincularlas
      if (imageUrls && imageUrls.length > 0) {
        const imageCreateData = imageUrls.map((url) => ({
          url,
          itemId: item.id,
        }));

        await tx.image.createMany({
          data: imageCreateData,
        });
      }

      return tx.item.findUnique({
        where: { id: item.id },
        include: {
          images: true,
        },
      });
    });

    return newItem;
  }

  /**
   * Busca un artículo por su ID.
   * @param itemId El ID del artículo.
   * @returns El artículo.
   */
  async findItemById(itemId: string) {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        images: true, // Incluimos las imágenes
      },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID "${itemId}" not found`);
    }
    return item;
  }
}