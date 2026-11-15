// src/auth/audit-log.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditLogStatus = 'SUCCESS' | 'FAILED' | 'LOCKED_OUT';

@Entity('audit_logs')
@Index('IDX_audit_logs_organization_created_at', [
  'organizationId',
  'createdAt',
])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  status: AuditLogStatus;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId: string | null;
}