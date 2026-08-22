import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  Request,
} from 'express';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  CreatePaymentDto,
} from './dto/create-payment.dto';

import {
  PaymentsService,
} from './payments.service';

type AuthenticatedRequest =
  Request & {
    user: {
      id: number;
      email: string;
      role: string;
    };
  };

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService:
      PaymentsService,
  ) {}

  @Post('create')
  @UseGuards(
    JwtAuthGuard,
  )
  create(
    @Req()
    request:
      AuthenticatedRequest,

    @Body()
    dto:
      CreatePaymentDto,
  ) {
    return this.paymentsService
      .create(
        request.user.id,
        dto,
      );
  }

  @Get(
    'ifthenpay/mbway/callback',
  )
  mbwayCallback(
    @Query('key')
    key: string,

    @Query('orderId')
    orderId: string,

    @Query('amount')
    amount: string,

    @Query('requestId')
    requestId: string,
  ) {
    return this.paymentsService
      .handleMbwayCallback(
        key,
        orderId,
        amount,
        requestId,
      );
  }

  @Get(':orderId')
  @UseGuards(
    JwtAuthGuard,
  )
  findByOrder(
    @Req()
    request:
      AuthenticatedRequest,

    @Param(
      'orderId',
      ParseIntPipe,
    )
    orderId: number,
  ) {
    return this.paymentsService
      .findByOrder(
        request.user.id,
        orderId,
      );
  }

}