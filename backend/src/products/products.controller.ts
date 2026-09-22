import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(
    private readonly productsService:
      ProductsService,
  ) { }

  @Get()
  findAll(
    @Query("locale")
    locale = "en",
  ) {
    return this.productsService.findAll(locale);
  }

  @Get(':slug')
  findBySlug(
    @Param('slug')
    slug: string,

    @Query('locale')
    locale = 'en',
  ) {
    return this.productsService.findBySlug(
      slug,
      locale,
    );
  }
}