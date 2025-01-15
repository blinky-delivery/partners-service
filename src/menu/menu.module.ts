import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { StoreModule } from 'src/store/store.module';
import { MenuController } from './menu.controller';

@Module({
    providers: [MenuService],
    imports: [StoreModule],
    controllers: [MenuController]
})
export class MenuModule { }
