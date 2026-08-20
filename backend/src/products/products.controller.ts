import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':slug')
  findOne(
    @Param('slug') slug: string,
  ) {
    return this.productsService.findBySlug(
      slug,
    );
  }
}