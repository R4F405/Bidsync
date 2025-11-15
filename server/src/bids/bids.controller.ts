import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { BidsService } from './bids.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @UseGuards(JwtAuthGuard) // Solo usuarios logueados pueden pujar
  @Post()
  async placeBid(
    @Request() req,
    @Body() createBidDto: CreateBidDto,
  ) {
    const userId = req.user.userId;
    return this.bidsService.placeBid(userId, createBidDto);
  }

  /**
   * Endpoint protegido para que un usuario consulte su
   * puja máxima actual en una subasta.
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-bid/:auctionId')
  async getMyMaxBid(
    @Request() req,
    @Param('auctionId') auctionId: string,
  ) {
    const userId = req.user.userId;
    return this.bidsService.findUserMaxBid(userId, auctionId);
  }
}