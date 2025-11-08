import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAuctionDto } from './dto/create-auction.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createAuctionDto: CreateAuctionDto,
  ) {
    const userId = req.user.userId;
    return this.auctionsService.createAuction(userId, createAuctionDto);
  }
}