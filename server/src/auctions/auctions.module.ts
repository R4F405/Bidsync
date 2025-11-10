import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, TransactionsModule, EventsModule],
  controllers: [AuctionsController],
  providers: [AuctionsService],
})
export class AuctionsModule {}