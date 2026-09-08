import {
    BadRequestException,
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
        const bucket =
            process.env.AWS_S3_BUCKET;

        const region =
            process.env.AWS_REGION;

        if (!bucket || !region) {
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
                ContentType: file.mimetype,
            })
        );

        return {
            filename,
            url:
                `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
        };
    }
}