import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importa PrismaModule para poder inyectar PrismaService
  providers: [UsersService],
  exports: [UsersService], // Exporta UsersService para que AuthModule pueda usarlo
})
export class UsersModule {}