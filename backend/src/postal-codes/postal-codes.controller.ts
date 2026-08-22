import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import { PostalCodesService } from './postal-codes.service';

@Controller('api/postal-codes')
export class PostalCodesController {
  constructor(
    private readonly postalCodesService:
      PostalCodesService,
  ) {}

  @Get(':postalCode')
  findOne(
    @Param('postalCode')
    postalCode: string,
  ) {
    if (
      !/^\d{4}-\d{3}$/.test(
        postalCode,
      )
    ) {
      throw new BadRequestException(
        'Invalid postal code format',
      );
    }

    return this.postalCodesService
      .findByPostalCode(
        postalCode,
      );
  }
}