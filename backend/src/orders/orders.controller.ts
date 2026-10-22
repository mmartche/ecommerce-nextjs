import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  Request,
} from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { OrdersService } from './orders.service';

import {
  CreateOrderDto,
} from './dto/create-order.dto';

import {
  CreateOrderMessageDto,
} from './dto/create-order-message.dto';

type AuthenticatedRequest =
  Request & {
    user: {
      id: number;
      email: string;
      role: string;
    };
  };

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private readonly ordersService:
      OrdersService,
  ) {}

  @Post()
  create(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    dto: CreateOrderDto,
  ) {
    return this.ordersService.create(
      request.user.id,
      dto,
    );
  }

  @Get()
  findAll(
    @Req()
    request: AuthenticatedRequest,
  ) {
    return this.ordersService
      .findAllByUser(
        request.user.id,
      );
  }

  @Get(':id')
  findOne(
    @Req()
    request: AuthenticatedRequest,

    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.ordersService
      .findOneByUser(
        request.user.id,
        id,
      );
  }

  @Get(':id/messages')
  getMessages(
    @Req() req,
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.ordersService
      .getMessages(
        req.user.id,
        orderId,
      );
  }

  @Post(':id/messages')
  createMessage(
    @Req() req,
    @Param(
      'id',
      ParseIntPipe,
    )
    orderId: number,

    @Body()
    dto: CreateOrderMessageDto,
  ) {
    return this.ordersService
      .createCustomerMessage(
        req.user.id,
        orderId,
        dto.message,
      );
  }
}