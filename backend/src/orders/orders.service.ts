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
  ) {}

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

    /*
     * IMPORTANT:
     * Prices come from PostgreSQL,
     * never from the browser.
     */
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

    /*
     * Validate products and
     * calculate subtotal.
     */
    let subtotal =
      new Prisma.Decimal(0);

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

        if (
          item.keys < product.minKeys ||
          item.keys > product.maxKeys
        ) {
          throw new BadRequestException(
            `Invalid number of keys for ${product.name}`,
          );
        }

        const unitPrice =
          new Prisma.Decimal(
            product.basePrice,
          );

        const totalPrice =
          unitPrice.mul(
            item.quantity,
          );

        subtotal =
          subtotal.add(totalPrice);

        return {
          quantity:
            item.quantity,

          keys:
            item.keys,

          colorName:
            item.color?.name ??
            null,

          colorHex:
            item.color?.hex ??
            null,

          fontName:
            item.font?.name ??
            null,

          bordered:
            item.font?.bordered ??
            false,

          unitPrice,
          totalPrice,

          productId:
            item.productId,
        };
      });

    /*
     * TEMPORARY weight calculation.
     *
     * Later we'll use Product.weightGrams.
     */
    const weightGrams =
      dto.items.reduce(
        (total, item) =>
          total +
          250 * item.quantity,
        0,
      );

    /*
     * Shipping is also calculated
     * by the backend.
     */
    const shippingQuote =
      this.shippingService.calculate(
        dto.shippingAddress
          .postalCode,
        weightGrams,
      );

    const shipping =
      new Prisma.Decimal(
        shippingQuote.price,
      );

    const total =
      subtotal.add(shipping);

    /*
     * Nested create:
     * Order + OrderItems in one operation.
     */
    return this.prisma.order.create({
      data: {
        status: 'PENDING',

        subtotal,
        shipping,
        total,

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