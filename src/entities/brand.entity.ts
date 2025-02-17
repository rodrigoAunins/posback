import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Brand {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  // Relación simplificada a Category por ID
  @Column({ type: 'varchar', length: 50 })
  categoryId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  image?: string;
}
