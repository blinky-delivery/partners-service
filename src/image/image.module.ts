import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  providers: [ImageService, StorageModule],
  controllers: [ImageController]
})
export class ImageModule { }
