import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async findAll(locale = "en") {
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
          translations: {
            where: {
              locale,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });

    return products.map(
      (product) => {
        const translation =
          product.translations[0];

        return {
          ...product,

          name:
            translation?.name ??
            product.name,

          description:
            translation?.description ??
            product.description,

          colors:
            product.colors.map(
              (item) =>
                item.color,
            ),

          fonts:
            product.fonts.map(
              (item) =>
                item.font,
            ),

          translations:
            undefined,
        };
      }
    );
  }

  async findBySlug(slug: string, locale = 'en') {
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

          translations: {
            where: {
              locale,
            },
          },
        },
      });

    if (!product) {
      throw new NotFoundException(
        'Product not found',
      );
    }

    const translation = product.translations[0];

    return {
      ...product,

      name:
        translation?.name ?? product.name,

      description:
        translation?.description ?? product.description,

      translations:
        undefined,

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