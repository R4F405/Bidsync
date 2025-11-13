import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  Get,
  Param,
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
  // 'images' es el nombre del campo en FormData. Límite de 10 archivos.
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Request() req,
    // Los datos de texto (title, description) vendrán en el Body
    @Body() createItemDto: CreateItemDto,
    // Los archivos vendrán aquí
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const ownerId = req.user.userId;

    // Construimos las URLs públicas para guardar en la BD
    // Multer nos da 'files', que tienen la propiedad 'path'
    // Reemplazamos 'public/' por '/public/' para que sea una URL válida
    const imageUrls = files.map(file => file.path.replace('public', '/public'));
    
    // Pasamos las URLs al servicio, que ya sabe cómo manejarlas
    return this.itemsService.createItem(ownerId, createItemDto, imageUrls);
  }
}