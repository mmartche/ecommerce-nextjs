import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  Prisma,
  OrderStatus,
} from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SaveProductDto } from './dto/save-product.dto';
import { UpdateOrderTrackingDto } from './dto/update-order-tracking.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) { }

  findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

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

  async findOrder(id: number) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

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

  async updateOrderStatus(
    id: number,
    status: OrderStatus,
  ) {
    const existing =
      await this.prisma.order.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    return this.prisma.order.update({
      where: {
        id,
      },

      data: {
        status,
      },
    });
  }

  async findAllProducts() {
    const products =
      await this.prisma.product.findMany({
        include: {
          colors: {
            include: {
              color: true,
            },
          },

          fonts: {
            include: {
              font: true,
            },
          },

          images: true,
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return products.map(
      (product) =>
        this.formatProduct(product),
    );
  }

  async findProduct(id: number) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },

        include: {
          colors: {
            include: {
              color: true,
            },
          },

          fonts: {
            include: {
              font: true,
            },
          },

          images: true,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return this.formatProduct(product);
  }

  async getProductCatalog() {
    const [colors, fonts] =
      await Promise.all([
        this.prisma.color.findMany({
          orderBy: {
            name: 'asc',
          },
        }),

        this.prisma.font.findMany({
          orderBy: [
            {
              name: 'asc',
            },
            {
              bordered: 'asc',
            },
          ],
        }),
      ]);

    return {
      colors,
      fonts,
    };
  }

  async createProduct(
    dto: SaveProductDto,
  ) {
    this.validateProduct(dto);

    const slug =
      dto.slug
        .trim()
        .toLowerCase();

    const existing =
      await this.prisma.product.findUnique({
        where: {
          slug,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Product slug already exists',
      );
    }

    await this.validateRelations(dto);

    const product =
      await this.prisma.product.create({
        data: {
          name: dto.name.trim(),

          slug,

          description:
            dto.description.trim(),

          basePrice:
            new Prisma.Decimal(
              dto.basePrice,
            ),

          pricePerKey:
            new Prisma.Decimal(
              dto.pricePerKey,
            ),

          baseWeightGrams:
            dto.baseWeightGrams,

          weightPerKeyGrams:
            dto.weightPerKeyGrams,

          minKeys: dto.minKeys,
          maxKeys: dto.maxKeys,

          active: dto.active,

          weightGrams: dto.weightGrams,

          colors: {
            create:
              dto.colorIds.map(
                (colorId) => ({
                  colorId,
                }),
              ),
          },

          fonts: {
            create:
              dto.fontIds.map(
                (fontId) => ({
                  fontId,
                }),
              ),
          },

          images: {
            create:
              dto.images.map(
                (image) => ({
                  url: image.url,
                  alt:
                    image.alt ||
                    dto.name,
                }),
              ),
          },
        },

        include: {
          colors: {
            include: {
              color: true,
            },
          },

          fonts: {
            include: {
              font: true,
            },
          },

          images: true,
        },
      });

    return this.formatProduct(product);
  }

  async updateProduct(
    id: number,
    dto: SaveProductDto,
  ) {
    this.validateProduct(dto);

    const existing =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const slugExists =
      await this.prisma.product.findFirst({
        where: {
          slug:
            dto.slug
              .trim()
              .toLowerCase(),

          NOT: {
            id,
          },
        },
      });

    if (slugExists) {
      throw new ConflictException(
        'Product slug already exists',
      );
    }

    await this.validateRelations(dto);

    await this.prisma.$transaction(
      async (tx) => {
        await tx.productColor.deleteMany({
          where: {
            productId: id,
          },
        });

        await tx.productFont.deleteMany({
          where: {
            productId: id,
          },
        });

        await tx.productImage.deleteMany({
          where: {
            productId: id,
          },
        });

        await tx.product.update({
          where: {
            id,
          },

          data: {
            name: dto.name.trim(),

            slug:
              dto.slug
                .trim()
                .toLowerCase(),

            description:
              dto.description.trim(),

            basePrice:
              new Prisma.Decimal(
                dto.basePrice,
              ),

            pricePerKey:
              new Prisma.Decimal(
                dto.pricePerKey,
              ),

            baseWeightGrams:
              dto.baseWeightGrams,

            weightPerKeyGrams:
              dto.weightPerKeyGrams,

            minKeys: dto.minKeys,
            maxKeys: dto.maxKeys,

            active: dto.active,

            weightGrams: dto.weightGrams,

            colors: {
              create:
                dto.colorIds.map(
                  (colorId) => ({
                    colorId,
                  }),
                ),
            },

            fonts: {
              create:
                dto.fontIds.map(
                  (fontId) => ({
                    fontId,
                  }),
                ),
            },

            images: {
              create:
                dto.images.map(
                  (image) => ({
                    url: image.url,
                    alt:
                      image.alt ||
                      dto.name,
                  }),
                ),
            },
          },
        });
      },
    );

    return this.findProduct(id);
  }

  async setProductActive(
    id: number,
    active: boolean,
  ) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          id,
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    return this.prisma.product.update({
      where: {
        id,
      },

      data: {
        active,
      },
    });
  }

  private validateProduct(
    dto: SaveProductDto,
  ) {
    if (
      dto.maxKeys <
      dto.minKeys
    ) {
      throw new BadRequestException(
        'maxKeys must be greater than or equal to minKeys',
      );
    }

    if (
      dto.colorIds.length === 0
    ) {
      throw new BadRequestException(
        'At least one color is required',
      );
    }

    if (
      dto.fontIds.length === 0
    ) {
      throw new BadRequestException(
        'At least one font is required',
      );
    }
  }

  private async validateRelations(
    dto: SaveProductDto,
  ) {
    const [colors, fonts] =
      await Promise.all([
        this.prisma.color.count({
          where: {
            id: {
              in: dto.colorIds,
            },
          },
        }),

        this.prisma.font.count({
          where: {
            id: {
              in: dto.fontIds,
            },
          },
        }),
      ]);

    if (
      colors !==
      dto.colorIds.length
    ) {
      throw new BadRequestException(
        'One or more colors do not exist',
      );
    }

    if (
      fonts !==
      dto.fontIds.length
    ) {
      throw new BadRequestException(
        'One or more fonts do not exist',
      );
    }
  }

  private formatProduct(
    product: any,
  ) {
    return {
      ...product,

      colors:
        product.colors.map(
          (item) => item.color,
        ),

      fonts:
        product.fonts.map(
          (item) => item.font,
        ),
    };
  }

  async updateOrderTracking(
    id: number,
    dto: UpdateOrderTrackingDto,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: { id },
      });

    if (!order) {
      throw new NotFoundException(
        "Order not found"
      );
    }

    return this.prisma.order.update({
      where: { id },

      data: {
        trackingCode:
          dto.trackingCode,

        trackingUrl:
          dto.trackingUrl || null,

        status: "SHIPPED",

        shippedAt:
          new Date(),
      },
    });
  }

}