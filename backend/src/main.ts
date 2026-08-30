import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import * as express from 'express';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_LOCAL_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
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