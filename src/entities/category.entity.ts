import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  image?: string;
}
