import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'invite_code' })
  inviteCode: string; // Унікальний код для приєднання нових співробітників

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}