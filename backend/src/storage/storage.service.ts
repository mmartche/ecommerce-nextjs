import {
  Injectable,
} from "@nestjs/common";

import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import {
  mkdir,
  writeFile,
} from "fs/promises";

import * as path from "path";
import { randomUUID } from "crypto";

@Injectable()
export class StorageService {
  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION,
  });

  async uploadProductImage(
    file: Express.Multer.File
  ) {
    const extension =
      path.extname(file.originalname);

    const filename =
      `${randomUUID()}${extension}`;

    if (
      process.env.STORAGE_TYPE !== "s3"
    ) {
      return this.saveLocal(
        file,
        filename
      );
    }

    return this.saveS3(
      file,
      filename
    );
  }

  private async saveLocal(
    file: Express.Multer.File,
    filename: string
  ) {
    const directory = path.join(
      process.cwd(),
      "uploads",
      "products"
    );

    await mkdir(directory, {
      recursive: true,
    });

    await writeFile(
      path.join(directory, filename),
      file.buffer
    );

    return {
      url:
        `/uploads/products/${filename}`,
    };
  }

  private async saveS3(
    file: Express.Multer.File,
    filename: string
  ) {
    const key =
      `products/${filename}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket:
          process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return {
      url:
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    };
  }
}