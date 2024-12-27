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

// Validation Constants
const SUPPORTED_IMAGE_TYPES = ['jpeg', 'png', 'webp'];
const SUPPORTED_DOCUMENT_TYPES = ['pdf', 'docx'];
const MAX_FILE_SIZE_MB = {
    DOCUMENT: 10,
    IMAGE: 5
};

@Injectable()
export class StorageService {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME');
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION'),
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
            },
        });
    }

    private validateFile(file: Express.Multer.File, type: FileType) {
        const fileExtension = file.originalname.split('.').pop();
        const fileSizeMB = file.size / (1024 * 1024);

        if (type === FileType.IMAGE && !SUPPORTED_IMAGE_TYPES.includes(fileExtension)) {
            throw new BadRequestException('Unsupported image type');
        }
        if (type === FileType.DOCUMENT && !SUPPORTED_DOCUMENT_TYPES.includes(fileExtension)) {
            throw new BadRequestException('Unsupported document type');
        }
        if (fileSizeMB > MAX_FILE_SIZE_MB[type]) {
            throw new BadRequestException(`File exceeds maximum size of ${MAX_FILE_SIZE_MB[type]} MB`);
        }
    }

    async uploadFile(storeId: string, file: Express.Multer.File, type: FileType): Promise<string> {
        this.validateFile(file, type);

        const fileKey = `${storeId}/${type.toLowerCase()}s/${uuidv4()}_${file.originalname}`;

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

