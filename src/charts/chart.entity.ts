import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('charts')
export class ChartEntity {
  @PrimaryColumn({ type: 'text' })
  id: string;

  @Column({ name: 'dashboard_id', type: 'text' })
  dashboardId: string;

  @Column({
    name: 'source_ids',
    type: 'jsonb',
    default: () => "'[]'::jsonb",
  })
  sourceIds: string[];

  @Column({ type: 'text', nullable: true })
  section: string | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ name: 'x_axis_field', type: 'text', nullable: true })
  xAxisField: string | null;

  @Column({ name: 'y_axis_field', type: 'text', nullable: true })
  yAxisField: string | null;

  @Column({ type: 'text', nullable: true })
  color: string | null;

  @Column({ name: 'user_id', type: 'text' })
  userId: string;
}
