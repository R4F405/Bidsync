import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: 'http://localhost:5173', // La URL de tu cliente React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilita la validación global automática para todos los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos desde el directorio 'public'
  // Esto permitirá que http://localhost:3000/uploads/imagen.png funcione
  app.use('/public', express.static(join(__dirname, '..', 'public')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();