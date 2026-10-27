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

  // Зберігає порядок графіків для кожної секції, наприклад: { "Секція 1": ["id1", "id2"] }
  @Column({
    name: 'charts_order',
    type: 'jsonb',
    nullable: true,
    default: () => "'{}'::jsonb",
  })
  chartsOrder: Record<string, string[]>;

  @Column({ name: 'user_id', type: 'text' })
  userId: string;
}