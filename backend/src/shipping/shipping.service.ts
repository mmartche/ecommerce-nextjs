import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ShippingService {
  calculate(
    postalCode: string,
    weightGrams = 250,
  ) {
    if (
      !/^\d{4}-\d{3}$/.test(postalCode)
    ) {
      throw new BadRequestException(
        'Invalid Portuguese postal code',
      );
    }

    /*
     * DEVELOPMENT PRICING ONLY.
     *
     * Later this is the place where
     * we'll call the real CTT API.
     */

    let price = 4.5;

    if (weightGrams > 500) {
      price = 5.5;
    }

    if (weightGrams > 1000) {
      price = 7.5;
    }

    return {
      provider: 'CTT',
      service: 'Standard',
      postalCode,
      weightGrams,
      price,
    };
  }
}