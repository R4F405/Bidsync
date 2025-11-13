import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Get, // <--- IMPORTAR
  Param, // <--- IMPORTAR
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Request() req,
    @Body() createItemDto: CreateItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const ownerId = req.user.userId;
    const imageUrls = files.map(file => file.path.replace('public', '/public'));
    
    return this.itemsService.createItem(ownerId, createItemDto, imageUrls);
  }

  /**
   * Endpoint para obtener un artículo por su ID.
   * Protegido para que solo usuarios logueados puedan ver artículos.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.itemsService.findItemById(id);
  }
}