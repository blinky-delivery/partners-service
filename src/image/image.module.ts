import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
  providers: [ImageService,],
  controllers: [ImageController],
  imports: [StorageModule]
})
export class ImageModule { }
