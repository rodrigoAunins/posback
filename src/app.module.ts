import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entidades
import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Product } from './entities/product.entity';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Local } from './entities/local.entity';

// Módulos
import { UserModule } from './modules/user.module';
import { CategoryModule } from './modules/category.module';
import { BrandModule } from './modules/brand.module';
import { ProductModule } from './modules/product.module';
import { SaleModule } from './modules/sale.module';
import { SyncModule } from './modules/sync.module';
import { ExcelImportModule } from './excel-import/excel-import.module';
import { LocalModule } from './modules/local.module';  // <-- Agregado

@Module({
  imports: [
    // Conexión HARDCODEADA a Postgres en Railway
    TypeOrmModule.forRoot({
      type: 'postgres',

      // PON tus datos REALES de Railway:
      host: 'postgres.railway.internal',  // Ejemplo
      port: 5432,                         // Puede variar
      username: 'postgres',
      password: 'cMDPLrMbRYTkCISdNYjvFERgEifVSZrI',
      database: 'railway',

      // Si tu DB requiere SSL, activa:
      ssl: {
        rejectUnauthorized: false,
      },

      entities: [
        User,
        Category,
        Brand,
        Product,
        Sale,
        SaleItem,
        Local, // Se ha agregado la entidad Local
      ],
      synchronize: true, // En producción, se recomienda usar migraciones
    }),

    // Módulos
    UserModule,
    CategoryModule,
    BrandModule,
    ProductModule,
    SaleModule,
    LocalModule,  // <-- Asegurarse de que el módulo de locales esté importado
    SyncModule,
    ExcelImportModule,
  ],
})
export class AppModule {}
