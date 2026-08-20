import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
} from '@prisma/client';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { AdminService } from './admin.service';

import {
  UpdateOrderStatusDto,
} from './dto/update-order-status.dto';

import {
  SaveProductDto,
} from './dto/save-product.dto';

import {
  UpdateProductActiveDto,
} from './dto/update-product-active.dto';

@Controller('api/admin')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(UserRole.ADMIN)

export class AdminController {
  constructor(
    private readonly adminService:
      AdminService,
  ) { }

  @Get('orders')
  findAllOrders() {
    return this.adminService
      .findAllOrders();
  }

  @Get('orders/:id')
  findOrder(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.adminService
      .findOrder(id);
  }

  @Patch('orders/:id/status')
  updateStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateOrderStatusDto,
  ) {
    return this.adminService
      .updateOrderStatus(
        id,
        dto.status,
      );
  }

  @Get('products')
  findAllProducts() {
    return this.adminService
      .findAllProducts();
  }

  @Get('products/:id')
  findProduct(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.adminService
      .findProduct(id);
  }

  @Get('catalog')
  getCatalog() {
    return this.adminService
      .getProductCatalog();
  }

  @Post('products')
  createProduct(
    @Body()
    dto: SaveProductDto,
  ) {
    return this.adminService
      .createProduct(dto);
  }

  @Patch('products/:id')
  updateProduct(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: SaveProductDto,
  ) {
    return this.adminService
      .updateProduct(
        id,
        dto,
      );
  }

  @Patch('products/:id/active')
  setProductActive(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: UpdateProductActiveDto,
  ) {
    return this.adminService
      .setProductActive(
        id,
        dto.active,
      );
  }
}