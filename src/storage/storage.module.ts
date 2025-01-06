import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { DirectusModule } from 'src/directus/directus.module';

@Module({
  providers: [StorageService],
  controllers: [StorageController],
  exports: [StorageService],
  imports: [DirectusModule]
})
export class StorageModule { }
