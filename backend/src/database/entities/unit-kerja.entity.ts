import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: UnitKerja
 * Master organizational units within BLUD
 */
@Entity('unit_kerja')
export class UnitKerja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  kodeUnit: string;

  @Column({ type: 'varchar', length: 255 })
  namaUnit: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  kepalaNama: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  kepalaNIP: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telepon: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
