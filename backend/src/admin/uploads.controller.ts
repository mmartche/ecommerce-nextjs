import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

import {
  extname,
  join,
} from 'path';

import {
  mkdir,
  unlink,
  writeFile,
} from 'fs/promises';

import {
  randomUUID,
} from 'crypto';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  UserRole,
} from '@prisma/client';

import {
  JwtAuthGuard,
} from '../auth/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/roles.guard';

import {
  Roles,
} from '../auth/roles.decorator';

@Controller('api/admin/uploads')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
@Roles(UserRole.ADMIN)
export class UploadsController {

  @Post('product-image')
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage: memoryStorage(),

        limits: {
          fileSize:
            5 *
            1024 *
            1024,
        },

        fileFilter: (
          request,
          file,
          callback,
        ) => {
          const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
          ];

          if (
            !allowedTypes.includes(
              file.mimetype,
            )
          ) {
            return callback(
              new BadRequestException(
                'Only JPG, PNG and WEBP images are allowed',
              ),
              false,
            );
          }

          callback(null, true);
        },
      },
    ),
  )
  async uploadProductImage(
    @UploadedFile()
    file:
      Express.Multer.File,

    @Body('slug')
    slug: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    const productSlug =
      this.sanitizeSlug(slug);

    if (!productSlug) {
      throw new BadRequestException(
        'Product slug is required',
      );
    }

    const extension =
      extname(
        file.originalname,
      ).toLowerCase();

    const filename =
      `${productSlug}-${randomUUID().slice(0, 8)}${extension}`;

    const storageType =
      process.env.STORAGE_TYPE ||
      'local';

    if (
      storageType === 's3'
    ) {
      return this.uploadToS3(
        file,
        filename,
        productSlug,
      );
    }

    return this.uploadLocal(
      file,
      filename,
      productSlug
    );
  }

  private async uploadLocal(
    file: Express.Multer.File,
    filename: string,
    slug: string,
  ) {
    const directory =
      join(
        process.cwd(),
        'uploads',
        'products',
        slug,
      );

    await mkdir(
      directory,
      {
        recursive: true,
      },
    );

    await writeFile(
      join(
        directory,
        filename,
      ),
      file.buffer,
    );

    return {
      filename,

      key:
        `products/${slug}/${filename}`,

      url:
        `/uploads/products/${slug}/${filename}`,
    };
  }

  private getS3Client() {
    const region =
      process.env.AWS_REGION;

    if (!region) {
      throw new BadRequestException(
        'AWS_REGION is not configured',
      );
    }

    return new S3Client({
      region,
    });
  }

  private async uploadToS3(
    file: Express.Multer.File,
    filename: string,
    slug: string,
  ) {
    const bucket =
      process.env.AWS_S3_BUCKET;

    const region =
      process.env.AWS_REGION;

    if (
      !bucket ||
      !region
    ) {
      throw new BadRequestException(
        'S3 storage is not configured',
      );
    }

    const key =
      `products/${slug}/${filename}`;

    const s3 =
      this.getS3Client();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType:
          file.mimetype,
      }),
    );

    return {
      filename,
      key,
      url:
        `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    };
  }

  private sanitizeSlug(
    slug: string,
  ) {
    return slug
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9-]/g,
        '-',
      )
      .replace(
        /-+/g,
        '-',
      )
      .replace(
        /^-|-$/g,
        '',
      );
  }

  @Delete('product-image')
  async deleteProductImage(
    @Body('url')
    url: string,
  ) {
    if (!url) {
      throw new BadRequestException(
        'Image URL is required',
      );
    }

    const storageType =
      process.env.STORAGE_TYPE ||
      'local';

    if (storageType === 's3') {
      return this.deleteFromS3(
        url,
      );
    }

    return this.deleteLocal(
      url,
    );
  }

  private async deleteLocal(
    url: string,
  ) {
    const prefix =
      '/uploads/products/';

    if (
      !url.startsWith(prefix)
    ) {
      throw new BadRequestException(
        'Invalid local image URL',
      );
    }

    const relativePath =
      url.substring(
        prefix.length,
      );

    const filePath =
      join(
        process.cwd(),
        'uploads',
        'products',
        relativePath,
      );

    try {
      await unlink(filePath);
    } catch (error: any) {
      if (
        error.code !== 'ENOENT'
      ) {
        throw error;
      }
    }

    return {
      success: true,
    };
  }

  private async deleteFromS3(
    url: string,
  ) {
    const bucket =
      process.env.AWS_S3_BUCKET;

    const region =
      process.env.AWS_REGION;

    if (!bucket || !region) {
      throw new BadRequestException(
        'S3 storage is not configured',
      );
    }

    const parsedUrl =
      new URL(url);

    const key =
      decodeURIComponent(
        parsedUrl.pathname.replace(
          /^\/+/,
          '',
        ),
      );

    if (
      !key.startsWith(
        'products/',
      )
    ) {
      throw new BadRequestException(
        'Invalid product image key',
      );
    }

    const s3 =
      this.getS3Client();

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    return {
      success: true,
    };
  }

}