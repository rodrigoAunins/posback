import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades (ajusta según tu carpeta/proyecto)
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Product } from './entities/product.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

// Módulos
import { UserModule } from './modules/user.module';
import { CategoryModule } from './modules/category.module';
import { BrandModule } from './modules/brand.module';
import { ProductModule } from './modules/product.module';
import { SaleModule } from './modules/sale.module';
import { SyncModule } from './modules/sync.module';

@Module({
  imports: [
    // 1) Carga las variables de entorno de Railway (isGlobal: true)
    ConfigModule.forRoot({
      isGlobal: true,
      // si deseas que NO cargue tu .env en prod, no pongas envFilePath
      // envFilePath: '.env', // en local
    }),

    // 2) Configuración de TypeORM usando la inyección de ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: parseInt(config.get<string>('DB_PORT') || '5432', 10),
        username: config.get<string>('DB_USER') || 'postgres',
        password: config.get<string>('DB_PASSWORD') || 'postgres',
        database: config.get<string>('DB_NAME') || 'postgres',
        // Registra las entidades
        entities: [User, Category, Brand, Product, Sale, SaleItem],
        // Para desarrollo puedes dejar synchronize: true
        // en producción se suele desactivar
        synchronize: true,
      }),
    }),

    // 3) Módulos de la aplicación
    UserModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    SaleModule,
    SyncModule,
  ],
})
export class AppModule {}
