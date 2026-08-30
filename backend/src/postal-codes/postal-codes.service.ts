import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostalCodesService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findByPostalCode(
    postalCode: string,
  ) {
    const normalized =
      postalCode.trim();

    const [postalCode4, postalCode3] = normalized.split('-');

    const result =
      await this.prisma.postalCode.findFirst({
        where: {
          postalCode4,
          ...(postalCode3 && {
            postalCode3,
          }),
        },
      });

    if (!result) {
      throw new NotFoundException(
        'Postal code not found',
      );
    }

    const street = [
      result.streetType,
      result.streetPreposition,
      result.streetTitle,
      result.streetPreposition2,
      result.streetName,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      valid: true,
      postalCode: `${result.postalCode4}-${result.postalCode3}`,
      postalDesignation: result.postalDesignation,
      locality: result.locality,
      districtCode: result.districtCode,
      countyCode: result.countyCode,
      street,
    };
  }
}