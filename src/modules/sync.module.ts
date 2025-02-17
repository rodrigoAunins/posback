import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Brand, Product, Sale, SaleItem])],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
