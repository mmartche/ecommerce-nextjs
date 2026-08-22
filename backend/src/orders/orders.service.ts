import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { ShippingService } from '../shipping/shipping.service';

import {
  CreateOrderDto,
} from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly shippingService:
      ShippingService,
  ) { }

  async create(
    userId: number,
    dto: CreateOrderDto,
  ) {
    /*
     * Get unique product ids
     */
    const productIds = [
      ...new Set(
        dto.items.map(
          (item) => item.productId,
        ),
      ),
    ];

    const products =
      await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },

          active: true,
        },

        select: {
          id: true,
          name: true,
          basePrice: true,
          pricePerKey: true,
          weightGrams: true,
          baseWeightGrams: true,
          weightPerKeyGrams: true,
          minKeys: true,
          maxKeys: true,
        },
      });

    const productMap =
      new Map(
        products.map(
          (product) => [
            product.id,
            product,
          ],
        ),
      );

    let subtotal =
      new Prisma.Decimal(0);

    let totalWeightGrams = 0;

    const orderItems =
      dto.items.map((item) => {
        const product =
          productMap.get(
            item.productId,
          );

        if (!product) {
          throw new BadRequestException(
            `Product ${item.productId} is not available`,
          );
        }

        const characters =
          item.characters?.trim() || "";

        /*
         * Produto personalizado por teclas
         */
        const hasKeyConfiguration =
          product.pricePerKey != null ||
          (
            product.baseWeightGrams != null &&
            product.weightPerKeyGrams != null
          );

        let keys = 0;

        if (hasKeyConfiguration) {
          keys = characters.length;

          if (!characters) {
            throw new BadRequestException(
              `Characters are required for ${product.name}`,
            );
          }

          if (
            item.keys !== keys
          ) {
            throw new BadRequestException(
              'Number of keys does not match characters',
            );
          }

          if (
            keys < product.minKeys ||
            keys > product.maxKeys
          ) {
            throw new BadRequestException(
              `Invalid number of keys for ${product.name}`,
            );
          }
        }

        /*
         * PRICE
         */
        const basePrice =
          new Prisma.Decimal(
            product.basePrice,
          );

        const pricePerKey =
          product.pricePerKey != null
            ? new Prisma.Decimal(
              product.pricePerKey,
            )
            : new Prisma.Decimal(0);

        const unitPrice =
          product.pricePerKey != null
            ? basePrice.add(
              pricePerKey.mul(keys),
            )
            : basePrice;

        const totalPrice =
          unitPrice.mul(
            item.quantity,
          );

        subtotal =
          subtotal.add(
            totalPrice,
          );

        let unitWeightGrams: number;

        if (
          product.baseWeightGrams != null &&
          product.weightPerKeyGrams != null
        ) {
          unitWeightGrams =
            product.baseWeightGrams +
            product.weightPerKeyGrams *
            keys;
        } else if (
          product.weightGrams != null
        ) {
          unitWeightGrams =
            product.weightGrams;
        } else {
          throw new BadRequestException(
            `Weight is not configured for ${product.name}`,
          );
        }

        totalWeightGrams +=
          unitWeightGrams *
          item.quantity;

        return {
          quantity:
            item.quantity,

          keys:
            hasKeyConfiguration
              ? keys
              : item.keys ?? 1,

          characters:
            characters || null,

          colorName:
            item.color?.name ?? null,

          colorHex:
            item.color?.hex ?? null,

          fontName:
            item.font?.name ?? null,

          bordered:
            item.font?.bordered ?? false,
          
          unitWeightGrams,

          unitPrice,
          totalPrice,

          productId:
            item.productId,
        };
      });
    const shippingQuote =
      this.shippingService.calculate(
        dto.shippingAddress.postalCode,
        totalWeightGrams,
      );

    const shipping =
      new Prisma.Decimal(
        shippingQuote.price,
      );

    const total =
      subtotal.add(shipping);

    return this.prisma.order.create({
      data: {
        status: 'PENDING',

        subtotal,
        shipping,
        total,
        totalWeightGrams,

        shippingProvider:
          shippingQuote.provider,

        shippingService:
          shippingQuote.service,

        shippingName:
          dto.shippingAddress.name,

        shippingAddress:
          dto.shippingAddress.address,

        shippingPostalCode:
          dto.shippingAddress
            .postalCode,

        shippingCity:
          dto.shippingAddress.city,

        shippingCountry:
          dto.shippingAddress.country,

        userId,

        items: {
          create: orderItems,
        },
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllByUser(
    userId: number,
  ) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneByUser(
    userId: number,
    orderId: number,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
        },

        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return order;
  }
}