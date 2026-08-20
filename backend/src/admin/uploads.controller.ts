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
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';

import {
  randomUUID,
} from 'crypto';

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
        storage: diskStorage({
          destination:
            './uploads/products',

          filename: (
            request,
            file,
            callback,
          ) => {
            const extension =
              extname(
                file.originalname,
              ).toLowerCase();

            const filename =
              `${randomUUID()}${extension}`;

            callback(
              null,
              filename,
            );
          },
        }),

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
  uploadProductImage(
    @UploadedFile()
    file:
      Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    return {
      filename:
        file.filename,

      url:
        `/uploads/products/${file.filename}`,
    };
  }
}