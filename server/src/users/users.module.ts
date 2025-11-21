import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';

@Module({
  imports: [PrismaModule], // Importa PrismaModule para poder inyectar PrismaService
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exporta UsersService para que AuthModule pueda usarlo
})
export class UsersModule { }