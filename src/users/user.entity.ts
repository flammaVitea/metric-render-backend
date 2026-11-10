import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export type UserRole = 'ADMIN' | 'MEMBER';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

@Entity('users')
export class UserEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', select: false })
  password: string;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId: string | null;

  @Column({ type: 'text', default: 'MEMBER' })
  role: UserRole;

  @Column({ type: 'text', default: 'PENDING' })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}