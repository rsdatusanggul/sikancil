import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ShortUrlTargetType } from '../enums';

/**
 * Entity: ShortUrl
 * Short URL untuk QR Code verification system
 * Format: https://sikancil.rsud-ds.go.id/v/{hash}
 */
@Entity('short_urls')
export class ShortUrl {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  @Index()
  hash: string; // Short hash untuk URL (8-16 karakter)

  @Column({ type: 'uuid' })
  @Index()
  targetId: string; // ID dari payment_voucher, SPP, dll

  @Column({ type: 'varchar', length: 50, default: ShortUrlTargetType.PAYMENT_VOUCHER })
  @Index()
  targetType: ShortUrlTargetType;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  expiresAt: Date; // NULL = tidak pernah expired

  @CreateDateColumn()
  createdAt: Date;
}
