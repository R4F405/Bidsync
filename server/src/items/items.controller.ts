import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createItemDto: CreateItemDto,
  ) {
    const ownerId = req.user.userId;

    return this.itemsService.createItem(ownerId, createItemDto);
  }
}