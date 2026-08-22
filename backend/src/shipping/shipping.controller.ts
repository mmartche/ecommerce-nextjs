import {
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ShippingService } from './shipping.service';

import {
  CalculateShippingDto,
} from './dto/calculate-shipping.dto';

@Controller('api/shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(
    private readonly shippingService:
      ShippingService,
  ) {}

  @Post('calculate')
  calculate(
    @Body()
    dto: CalculateShippingDto,
  ) {
    return this.shippingService.calculate(
      dto.postalCode,
      dto.weightGrams,
    );
  }
}