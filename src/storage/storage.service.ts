import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { DirectusService } from 'src/directus/directus.service';
import { createFolder, readFolder, uploadFiles } from '@directus/sdk';

// Enums for file types
export enum FileType {
    DOCUMENT = 'DOCUMENT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    OTHER = 'OTHER'
}

export enum DirectusFolder {
    store_applications = '2f748fa2-aeea-4df6-b950-9ac9144750aa',
}


@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private bucketName: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly directusService: DirectusService,
    ) {
        this.bucketName = this.configService.get<string>('BLINKY_AWS_BUCKET_NAME')!;
        this.s3Client = new S3Client({
            region: this.configService.get<string>('BLINKY_AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('BLINKY_AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('BLINKY_AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    async uploadFile(path: string, file: Express.Multer.File): Promise<string> {

        const fileKey = `${path}/${uuidv4()}_${file.originalname}`;

        try {
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            }));
            this.logger.log(`File uploaded successfully: ${fileKey}`);
            return fileKey;
        } catch (error) {
            this.logger.error('Failed to upload file to S3', error);
            throw new BadRequestException('File upload failed');
        }
    }

    async uploadFileToDirectus(file: Express.Multer.File, folderId: string) {
        const formData = new FormData()
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append('folder', folderId)
        formData.append('file', blob, file.originalname);
        return this.directusService.client.request(uploadFiles(formData))
    }

    async getFolderById(folderId: string) {
        try {
            const folder = await this.directusService.client.request(readFolder(folderId))
            return folder
        } catch (error) {

        }
    }

    async createFileFolder(folderName: string, folderId: string) {
        try {
            const folder = await this.directusService.client.request(createFolder({
                id: folderId,
                name: folderName
            }))

            return folder
        } catch (error) {

        }
    }
}