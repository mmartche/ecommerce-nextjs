import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    const products =
      await this.prisma.product.findMany({
        where: {
          active: true,
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

        orderBy: {
          createdAt: 'desc',
        },
      });

    return products.map(
      (product) => ({
        ...product,

        colors:
          product.colors.map(
            (item) => item.color,
          ),

        fonts:
          product.fonts.map(
            (item) => item.font,
          ),
      }),
    );
  }

  async findBySlug(slug: string) {
    const product =
      await this.prisma.product.findUnique({
        where: {
          slug,
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
}