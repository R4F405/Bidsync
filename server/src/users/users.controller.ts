import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/items')
  async getMyItems(@Request() req) {
    return this.usersService.getUserItems(req.user.userId);
  }

  @Get('me/bids')
  async getMyBids(@Request() req) {
    return this.usersService.getUserBids(req.user.userId);
  }

  @Get('me/won-auctions')
  async getMyWonAuctions(@Request() req) {
    return this.usersService.getUserWonAuctions(req.user.userId);
  }
}
