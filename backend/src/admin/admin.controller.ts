import {
  Body,
  Delete,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  UserRole,
  OrderStatus,
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

import { UpdateOrderTrackingDto }
  from "./dto/update-order-tracking.dto";
import { CreateColorDto } from './dto/create-color.dto';
import { CreateFontDto } from './dto/create-font.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Request } from 'express';
import {
  SaveShippingRateDto,
} from './dto/save-shipping-rate.dto';

import {
  CreateOrderMessageDto,
} from '../orders/dto/create-order-message.dto';

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

  @Patch("orders/:id/tracking")
  updateOrderTracking(
    @Param("id", ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateOrderTrackingDto,
  ) {
    return this.adminService
      .updateOrderTracking(id, dto);
  }

  @Post("colors")
  createColor(@Body() dto: CreateColorDto) {
    return this.adminService.createColor(dto);
  }

  @Post("fonts")
  createFont(@Body() dto: CreateFontDto) {
    return this.adminService.createFont(dto);
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @Req() request: Request,
  ) {
    return this.adminService.updateUserRole(
      id,
      dto.role,
      request['user'].id,
    );
  }

  @Get('users/:id')
  getUser(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.adminService.getUser(id);
  }
  @Get('shipping-rates')
  getShippingRates() {
    return this.adminService
      .getShippingRates();
  }

  @Get('shipping-rates/:id')
  getShippingRate(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.adminService
      .getShippingRate(id);
  }

  @Post('shipping-rates')
  createShippingRate(
    @Body()
    dto: SaveShippingRateDto,
  ) {
    return this.adminService
      .createShippingRate(dto);
  }

  @Patch('shipping-rates/:id')
  updateShippingRate(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    dto: SaveShippingRateDto,
  ) {
    return this.adminService
      .updateShippingRate(
        id,
        dto,
      );
  }

  @Delete('shipping-rates/:id')
  deleteShippingRate(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.adminService
      .deleteShippingRate(id);
  }

  @Get('orders/:id/messages')
  getOrderMessages(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.adminService
      .getOrderMessages(
        orderId,
      );
  }

  @Post('orders/:id/messages')
  createOrderMessage(
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,

    @Body()
    dto: CreateOrderMessageDto,
  ) {
    return this.adminService
      .createOrderMessage(
        orderId,
        dto.message,
      );
  }

  @Patch('orders/:id')
  updateOrderStatus(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    body: {
      status: OrderStatus;
    },
  ) {
    return this.adminService
      .updateOrderStatus(
        id,
        body.status,
      );
  }
}