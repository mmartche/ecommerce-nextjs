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
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UploadsService } from './uploads.service';

@Controller('api/admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
  ) { }

  @Post('product-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (request, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Only JPG, PNG and WEBP images are allowed',
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('draftId') draftId?: string,
    @Body('slug') slug?: string,
  ) {
    return this.uploadsService.uploadProductImage(
      file,
      { draftId, slug },
    );
  }

  @Delete('product-image')
  deleteProductImage(
    @Body('url') url: string,
  ) {
    return this.uploadsService.deleteProductImage(url);
  }
}
