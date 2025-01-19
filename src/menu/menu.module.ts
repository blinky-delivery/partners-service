import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { StoreModule } from 'src/store/store.module';
import { MenuController } from './menu.controller';
import { StorageModule } from 'src/storage/storage.module';

@Module({
    providers: [MenuService],
    imports: [StoreModule, StorageModule],
    controllers: [MenuController]
})
export class MenuModule { }
