import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateBidDto {
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsNumber()
  @IsPositive()
  maxAmount: number;
}