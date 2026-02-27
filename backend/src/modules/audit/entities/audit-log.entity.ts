import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  // Auth
  LOGIN           = 'LOGIN',
  LOGOUT          = 'LOGOUT',
  LOGIN_FAILED    = 'LOGIN_FAILED',
  TOKEN_REFRESH   = 'TOKEN_REFRESH',

  // CRUD
  CREATE          = 'CREATE',
  UPDATE          = 'UPDATE',
  DELETE          = 'DELETE',
  VIEW            = 'VIEW',
  EXPORT          = 'EXPORT',

  // Workflow BLUD
  APPROVE         = 'APPROVE',
  REJECT          = 'REJECT',
  SUBMIT          = 'SUBMIT',
  REVISE          = 'REVISE',
  CANCEL          = 'CANCEL',
  VERIFY          = 'VERIFY',

  // Security
  UNAUTHORIZED    = 'UNAUTHORIZED',
  FORBIDDEN       = 'FORBIDDEN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  LOCK_ACCOUNT    = 'LOCK_ACCOUNT',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED  = 'FAILED',
}

export enum AuditEntityType {
  SESSION    = 'SESSION',
  USER       = 'USER',
  SPP        = 'SPP',
  SPM        = 'SPM',
  SP2D       = 'SP2D',
  KWI        = 'KWI',
  JURNAL     = 'JURNAL',
  BKU        = 'BKU',
  SPJ        = 'SPJ',
  RBA        = 'RBA',
  RAK        = 'RAK',
  DPA        = 'DPA',
  PEGAWAI    = 'PEGAWAI',
  SUPPLIER   = 'SUPPLIER',
  COA        = 'COA',
  UNIT_KERJA = 'UNIT_KERJA',
  PAJAK      = 'PAJAK',
  LAPORAN    = 'LAPORAN',
  SYSTEM     = 'SYSTEM',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['entityType', 'entityId'])
@Index(['action', 'timestamp'])
@Index(['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- WHO ---
  @Column({ name: 'user_id', nullable: true })
  @Index()
  userId: string;

  @Column({ name: 'user_name', nullable: true })
  userName: string;

  @Column({ name: 'user_nip', nullable: true })
  userNip: string;

  @Column({ name: 'user_role', nullable: true })
  userRole: string;

  @Column({ name: 'unit_kerja', nullable: true })
  unitKerja: string;

  // --- WHAT ---
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 50, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'entity_label', nullable: true })
  entityLabel: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ name: 'changed_fields', type: 'jsonb', nullable: true })
  changedFields: string[];

  @Column({ nullable: true })
  reason: string;

  // --- STATUS ---
  @Column({ type: 'varchar', length: 10, default: AuditStatus.SUCCESS })
  status: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  // --- WHERE ---
  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'browser_name', nullable: true })
  browserName: string;

  @Column({ name: 'os_name', nullable: true })
  osName: string;

  // --- WHEN ---
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  @Index()
  timestamp: Date;

  // --- INTEGRITY ---
  @Column({ type: 'text' })
  hash: string;

  @Column({ name: 'prev_hash', type: 'text', nullable: true })
  prevHash: string;
}
