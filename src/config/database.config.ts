import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// Importa las entidades que quieras cargar
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';

// Exporta la función factory que recibirá el ConfigService
export const databaseConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    // Cambia a tu DB deseada. Ej: 'postgres' o 'mysql' o 'mssql'
    type: 'postgres',

    // Lectura de variables con fallback en caso de que no existan
    host: configService.get<string>('DB_HOST') || 'localhost',
    port: parseInt(configService.get<string>('DB_PORT') || '5432', 10),
    username: configService.get<string>('DB_USER') || 'postgres',
    password: configService.get<string>('DB_PASSWORD') || 'postgres',
    database: configService.get<string>('DB_NAME') || 'postgres',

    // Registra las entidades
    entities: [
      User,
      Category,
      Brand,
      Product,
      Sale,
      SaleItem,
      // ... otras que tengas
    ],

    // A efectos de prueba, habilitamos sincronización. En producción se suele desactivar
    synchronize: true,

    // Opciones extra para Postgres (si las necesitas)
    // ssl: { rejectUnauthorized: false }, // si tu DB requiere SSL
  };
};
