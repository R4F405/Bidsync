import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
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
}