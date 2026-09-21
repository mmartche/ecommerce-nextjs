import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import {
  copyFile,
  mkdir,
  rm,
  unlink,
  writeFile,
} from 'fs/promises';

import {
  basename,
  extname,
  join,
} from 'path';

import { randomUUID } from 'crypto';

type ProductImageInput = {
  url: string;
  alt?: string;
};

@Injectable()
export class UploadsService {
  private get storageType() {
    return process.env.STORAGE_TYPE || 'local';
  }

  private sanitizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private validateDraftId(draftId: string) {
    if (!/^[a-zA-Z0-9_-]{8,100}$/.test(draftId)) {
      throw new BadRequestException('Invalid draft id');
    }

    return draftId;
  }

  private getS3Client() {
    const region = process.env.AWS_REGION;

    if (!region) {
      throw new BadRequestException('AWS_REGION is not configured');
    }

    return new S3Client({ region });
  }

  async uploadProductImage(
    file: Express.Multer.File,
    options: { draftId?: string; slug?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const extension = extname(file.originalname).toLowerCase();

    if (options.draftId) {
      const draftId = this.validateDraftId(options.draftId);
      const filename = `${randomUUID()}${extension}`;
      const key = `tmp/${draftId}/${filename}`;

      return this.saveFile(file, key, filename);
    }

    if (options.slug) {
      const slug = this.sanitizeSlug(options.slug);

      if (!slug) {
        throw new BadRequestException('Invalid product slug');
      }

      const filename = `${slug}-${randomUUID().slice(0, 8)}${extension}`;
      const key = `products/${slug}/${filename}`;

      return this.saveFile(file, key, filename);
    }

    throw new BadRequestException('draftId or slug is required');
  }

  private async saveFile(
    file: Express.Multer.File,
    key: string,
    filename: string,
  ) {
    if (this.storageType === 's3') {
      const bucket = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION;

      if (!bucket || !region) {
        throw new BadRequestException('S3 storage is not configured');
      }

      const s3 = this.getS3Client();

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      return {
        filename,
        key,
        url: `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
      };
    }

    const filePath = join(process.cwd(), 'uploads', key);

    await mkdir(join(filePath, '..'), { recursive: true });
    await writeFile(filePath, file.buffer);

    return {
      filename,
      key,
      url: `/uploads/${key}`,
    };
  }

  async deleteProductImage(url: string) {
    if (!url) {
      throw new BadRequestException('Image URL is required');
    }

    const key = this.extractStorageKey(url);

    if (!key.startsWith('tmp/') && !key.startsWith('products/')) {
      throw new BadRequestException('Invalid product image path');
    }

    if (this.storageType === 's3') {
      const bucket = process.env.AWS_S3_BUCKET;

      if (!bucket) {
        throw new BadRequestException('S3 storage is not configured');
      }

      await this.getS3Client().send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );

      return { success: true };
    }

    const uploadsRoot = join(process.cwd(), 'uploads');
    const filePath = join(uploadsRoot, key);

    if (!filePath.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid image path');
    }

    try {
      await unlink(filePath);
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }

    return { success: true };
  }

  async promoteDraftImages(
    draftId: string | undefined,
    slugValue: string,
    images: ProductImageInput[],
  ) {
    const slug =
      this.sanitizeSlug(slugValue);

    if (!slug) {
      throw new BadRequestException(
        'Invalid product slug',
      );
    }

    const safeDraftId =
      draftId
        ? this.validateDraftId(draftId)
        : undefined;

    const promoted: ProductImageInput[] =
      [];

    for (const image of images) {
      const key =
        this.extractStorageKey(
          image.url,
        );

      if (
        !key.startsWith('tmp/')
      ) {
        promoted.push(image);
        continue;
      }

      const parts =
        key.split('/');

      const imageDraftId =
        parts[1];

      if (
        safeDraftId &&
        imageDraftId !== safeDraftId
      ) {
        throw new BadRequestException(
          'Temporary image does not belong to this product draft',
        );
      }

      const extension =
        extname(
          basename(key),
        ).toLowerCase();

      const newFilename =
        `${slug}-${randomUUID().slice(0, 8)}${extension}`;

      const newKey =
        `products/${slug}/${newFilename}`;

      await this.moveFile(
        key,
        newKey,
      );

      promoted.push({
        ...image,

        url:
          this.storageType === 's3'
            ? this.buildS3Url(
                newKey,
              )
            : `/uploads/${newKey}`,
      });
    }

    if (safeDraftId) {
      await this.cleanupDraft(
        safeDraftId,
      );
    }

    return promoted;
  }

  private async moveFile(sourceKey: string, targetKey: string) {
    if (this.storageType === 's3') {
      const bucket = process.env.AWS_S3_BUCKET;

      if (!bucket) {
        throw new BadRequestException('S3 storage is not configured');
      }

      const s3 = this.getS3Client();

      await s3.send(
        new CopyObjectCommand({
          Bucket: bucket,
          CopySource: `${bucket}/${sourceKey}`,
          Key: targetKey,
        }),
      );

      await s3.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: sourceKey,
        }),
      );

      return;
    }

    const uploadsRoot = join(process.cwd(), 'uploads');
    const source = join(uploadsRoot, sourceKey);
    const target = join(uploadsRoot, targetKey);

    if (!source.startsWith(uploadsRoot) || !target.startsWith(uploadsRoot)) {
      throw new BadRequestException('Invalid image path');
    }

    await mkdir(
      join(target, '..'),
      {
        recursive: true,
      },
    );

    await copyFile(
      source,
      target,
    );

    await unlink(
      source,
    );
  }

  private async cleanupDraft(draftId: string) {
    if (this.storageType === 's3') {
      return;
    }

    await rm(
      join(process.cwd(), 'uploads', 'tmp', draftId),
      { recursive: true, force: true },
    );
  }

  private extractStorageKey(url: string) {
    if (url.startsWith('/uploads/')) {
      return decodeURIComponent(url.substring('/uploads/'.length));
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.replace(/^\/+/, ''));
    }

    throw new BadRequestException('Invalid image URL');
  }

  private buildS3Url(key: string) {
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;

    if (!bucket || !region) {
      throw new BadRequestException('S3 storage is not configured');
    }

    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
}
