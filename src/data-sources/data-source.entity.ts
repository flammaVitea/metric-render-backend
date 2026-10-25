import { Column, Entity, PrimaryColumn } from 'typeorm';

export type DataSourceType = 'rest' | 'csv';
export type DataSourceStatus = 'active' | 'error' | 'pending';

@Entity('data_sources')
export class DataSourceEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  type: DataSourceType;

  @Column({ name: 'url_or_path', type: 'text' })
  urlOrPath: string;

  @Column({ type: 'text', nullable: true })
  status: DataSourceStatus | null;

  @Column({ name: 'last_sync', type: 'timestamptz', nullable: true })
  lastSync: Date | null;

  @Column({ name: 'visible_fields', type: 'jsonb', nullable: true })
  visibleFields: string[] | null;

  @Column({ name: 'hidden_fields', type: 'jsonb', nullable: true })
  hiddenFields: string[] | null;

  @Column({ name: 'user_id', type: 'text' })
  userId: string;
}
