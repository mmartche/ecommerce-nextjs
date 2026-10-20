import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

export type ShippingQuote = {
  provider: string;
  service: string;
  postalCode: string;
  weightGrams: number;
  price: number;
  estimatedDelivery: string;
  deliveryNote: string;
};

@Injectable()
export class ShippingService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) { }

  async calculate(
    postalCode: string,
    weightGrams: number,
  ): Promise<ShippingQuote> {
    const normalizedPostalCode =
      postalCode.trim();

    if (
      !/^\d{4}-\d{3}$/.test(
        normalizedPostalCode
      )
    ) {
      throw new BadRequestException(
        'Invalid Portuguese postal code',
      );
    }

    if (
      !weightGrams ||
      weightGrams <= 0
    ) {
      throw new BadRequestException(
        'Invalid shipment weight',
      );
    }

    const postalCodePrefix =
      Number(
        normalizedPostalCode.substring(
          0,
          4,
        )
      );

    const rate =
      await this.prisma.shippingRate.findFirst({
        where: {
          active: true,

          postalCodeFrom: {
            lte:
              postalCodePrefix,
          },

          postalCodeTo: {
            gte:
              postalCodePrefix,
          },

          minWeightGrams: {
            lte:
              weightGrams,
          },

          maxWeightGrams: {
            gte:
              weightGrams,
          },
        },

        orderBy: {
          price: 'asc',
        },
      });

    if (!rate) {
      throw new BadRequestException(
        'No shipping rate available for this postal code and weight',
      );
    }

    return {
      provider: rate.provider,

      service: rate.service,

      postalCode: normalizedPostalCode,

      weightGrams,

      price:
        Number(
          rate.price
        ),

      estimatedDelivery:
        rate.estimatedDelivery ||
        '',

      deliveryNote:
        rate.deliveryNote ||
        '',
    };
  }
}