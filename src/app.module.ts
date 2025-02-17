import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa tu función de configuración de TypeORM:
import { databaseConfig } from './config/database.config';

// Ejemplo de importaciones de entidades (ajusta según tu carpeta):
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Product } from './entities/product.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

// Importaciones de módulos (CRUD) - ajusta según tu código
import { UserModule } from './modules/user.module';
import { CategoryModule } from './modules/category.module';
import { BrandModule } from './modules/brand.module';
import { ProductModule } from './modules/product.module';
import { SaleModule } from './modules/sale.module';

// Ejemplo de un módulo "Sync"
import { SyncModule } from './modules/sync.module';

@Module({
  imports: [
    // 1) Carga variables de entorno globalmente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2) Configuración de TypeORM con método asíncrono
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],       // Importamos ConfigModule para usarlo en la factory
      useFactory: databaseConfig,    // Nuestra función de configuración
      inject: [ConfigService],       // Inyectamos ConfigService
    }),

    // (Opcional) Si quieres registrar aquí entidades, se podría:
    // TypeOrmModule.forFeature([User, Category, Brand, Product, Sale, SaleItem]),

    // 3) Módulos de tu app
    UserModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    SaleModule,
    SyncModule,
  ],
})
export class AppModule {}
