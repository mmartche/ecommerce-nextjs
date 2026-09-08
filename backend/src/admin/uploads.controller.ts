import {
  BadRequestException,
  Controller,
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
  writeFile,
} from 'fs/promises';

import {
  randomUUID,
} from 'crypto';

import {
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
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    const extension =
      extname(
        file.originalname,
      ).toLowerCase();

    const filename =
      `${randomUUID()}${extension}`;

    const storageType =
      process.env.STORAGE_TYPE ||
      'local';

    if (
      storageType === 's3'
    ) {
      return this.uploadToS3(
        file,
        filename,
      );
    }

    return this.uploadLocal(
      file,
      filename,
    );
  }

  private async uploadLocal(
    file:
      Express.Multer.File,
    filename: string,
  ) {
    const directory =
      join(
        process.cwd(),
        'uploads',
        'products',
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

      url:
        `/uploads/products/${filename}`,
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
    file:
      Express.Multer.File,
    filename: string,
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
      `products/${filename}`;

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

      url:
        `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    };
  }
}