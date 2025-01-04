import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

// Enums for file types
export enum FileType {
    DOCUMENT = 'DOCUMENT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    OTHER = 'OTHER'
}


@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('BLINKY_AWS_BUCKET_NAME');
        this.s3Client = new S3Client({
            region: this.configService.get<string>('BLINKY_AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('BLINKY_AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('BLINKY_AWS_SECRET_ACCESS_KEY'),
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
}

