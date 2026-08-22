import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import { getShippingRegion } from './shipping-region';

export type ShippingQuote = {
  provider: string;
  service: string;
  postalCode: string;
  weightGrams: number;
  price: number;
  estimatedDeliveryDays: number;
  estimatedDelivery: string;
  deliveryNote: string;
};

@Injectable()
export class ShippingService {
  calculate(
    postalCode: string,
    weightGrams: number,
  ): ShippingQuote {
    const normalizedPostalCode = postalCode.trim();
    const region = getShippingRegion(normalizedPostalCode);
    if (
      !/^\d{4}-\d{3}$/.test(normalizedPostalCode)
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

    let price: number;

    if (weightGrams <= 100) {
      price = 1.58;
    } else if (
      weightGrams <= 500
    ) {
      price = 2.34;
    } else if (
      weightGrams <= 2000
    ) {
      price = 5.55;
    } else {
      throw new BadRequestException(
        'Shipping calculation is currently available only up to 2kg',
      );
    }

    return {
      provider: 'CTT',
      service: 'Standard',

      postalCode: normalizedPostalCode,
      weightGrams,

      price,

      estimatedDeliveryDays:
        region === 'ISLANDS'
          ? null
          : 3,

      estimatedDelivery:
        region === 'ISLANDS'
          ? 'Delivery may take longer'
          : 'About 3 business days',

      deliveryNote:
        region === 'ISLANDS'
          ? 'Delivery times to Azores and Madeira may be extended due to transport limitations.'
          : 'Delivery time is indicative.',
    };
  }
}