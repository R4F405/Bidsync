import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Opcional: Habilita el logging de todas las consultas de Prisma en desarrollo
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    // Conecta a la base de datos cuando el módulo se inicializa
    await this.$connect();
  }

  async onModuleDestroy() {
    // Desconecta de la base de datos cuando la aplicación se apaga
    await this.$disconnect();
  }
}