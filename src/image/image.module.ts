import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { StorageModule } from 'src/storage/storage.module';
import { StoreModule } from 'src/store/store.module';

@Module({
  providers: [ImageService,],
  controllers: [ImageController],
  imports: [StorageModule, StoreModule]
})
export class ImageModule { }
