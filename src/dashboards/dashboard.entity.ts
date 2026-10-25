import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('dashboards')
export class DashboardEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({
    name: 'section_order',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  sectionOrder: string[];

  @Column({ name: 'user_id', type: 'text' })
  userId: string;
}
