// product.entity.ts
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('float')
  price: number;

  // Este stock siempre refleja el “stock total”.
  @Column('int')
  stock: number;

  @Column({ type: 'varchar', length: 50 })
  categoryId: string;

  @Column({ type: 'varchar', length: 50 })
  brandId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  barcode?: string;

  @Column({ type: 'text', nullable: true })
  image?: string;

  @Column({ type: 'text', nullable: true })
  variantsJson: string | null; // en lugar de 'variantsJson?: string;'

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}
