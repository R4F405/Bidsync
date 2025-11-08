import {IsString, IsNotEmpty, IsDateString, IsNumber, IsPositive, IsOptional, Min } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Se recibe como string ISO (ej: "2025-11-10T10:00:00Z")

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsPositive() // El precio debe ser > 0
  startPrice: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  reservePrice?: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  buyNowPrice?: number;
}