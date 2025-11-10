import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { AuctionsModule } from './auctions/auctions.module';
import { BidsModule } from './bids/bids.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ItemsModule, AuctionsModule, BidsModule, TransactionsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
