import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostalCodesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findByPostalCode(
    postalCode: string,
  ) {
    const normalized =
      postalCode.trim();

    const result =
      await this.prisma.postalCode.findUnique({
        where: {
          postalCode: normalized,
        },
      });

    if (!result) {
      throw new NotFoundException(
        'Postal code not found',
      );
    }

    return {
      valid: true,
      postalCode:
        result.postalCode,
      locality:
        result.locality,
      district:
        result.district,
      county:
        result.county,
      street:
        result.street,
    };
  }
}