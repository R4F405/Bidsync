import { Controller, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionStatusDto } from './dto/update-auction-status.dto';

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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status') // Se mapea a PATCH /auctions/id/status
  async updateStatus(
    @Request() req,
    @Param('id') auctionId: string, // Obtiene 'id' de la URL
    @Body() updateAuctionStatusDto: UpdateAuctionStatusDto, // Obtiene { "status": "..." } del body
  ) {
    const userId = req.user.userId;
    const newStatus = updateAuctionStatusDto.status;

    return this.auctionsService.updateAuctionStatus(
      auctionId,
      userId,
      newStatus,
    );
  }
}