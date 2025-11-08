import { IsEnum, IsNotEmpty } from 'class-validator';
import { AuctionStatus } from '@prisma/client';

export class UpdateAuctionStatusDto {
  @IsEnum(AuctionStatus, {
    message: 'Status must be a valid AuctionStatus enum value (DRAFT, ACTIVE, ENDED, etc.)',
  })
  @IsNotEmpty()
  status: AuctionStatus;
}