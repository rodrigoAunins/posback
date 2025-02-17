import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class User {
  // Usamos VARCHAR
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 20 })
  role: string;
}
