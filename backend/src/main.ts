import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import * as express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const frontendUrl =
    process.env.FRONTEND_URL ||
    "http://192.168.50.159:3000";

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(
    '/uploads',
    express.static(
      join(process.cwd(), 'uploads'),
    ),
  );

  await app.listen(4000, '0.0.0.0');

  console.log('API running on port 4000');
}

bootstrap();