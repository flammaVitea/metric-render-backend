import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { v7 as uuidv7 } from 'uuid';

import { DashboardEntity } from './dashboard.entity';

interface ChartLayoutItem {
  id: string;
  span: number;
}

@Injectable()
export class DashboardsService {
  constructor(
    @InjectRepository(DashboardEntity)
    private readonly dashboardsRepository: Repository<DashboardEntity>,
  ) {}

  async findAll(userId?: string): Promise<DashboardEntity[]> {
    if (userId) {
      return this.dashboardsRepository.find({ where: { userId } });
    }
    return this.dashboardsRepository.find();
  }

  async updateSectionLayout(
    dashboardId: string,
    sectionName: string,
    items: ChartLayoutItem[],
    userId?: string,
  ): Promise<DashboardEntity> {
    const dashboard = await this.findOne(dashboardId, userId);
    const currentOrder = dashboard.chartsOrder || {};
  
    // Зберігаємо масив об'єктів { id, span } для секції
    currentOrder[sectionName] = items as any;
    dashboard.chartsOrder = { ...currentOrder };

    return this.dashboardsRepository.save(dashboard);
  }

  async findOne(id: string, userId?: string): Promise<DashboardEntity> {
    const where = userId ? { id, userId } : { id };
    const dashboard = await this.dashboardsRepository.findOne({ where });
    if (!dashboard) {
      throw new NotFoundException(`Дашборд з id "${id}" не знайдено`);
    }
    return dashboard;
  }

  async create(
    payload: Partial<DashboardEntity>,
    userId: string,
  ): Promise<DashboardEntity> {
    const id = payload.id ?? uuidv7();
    if (!isUUID(id, 'all')) {
      throw new BadRequestException('ID дашборда має бути UUID');
    }
    const entity = this.dashboardsRepository.create({
      id,
      name: payload.name ?? 'Новий дашборд',
      sectionOrder: Array.isArray(payload.sectionOrder)
        ? payload.sectionOrder
        : [],
      chartsOrder: payload.chartsOrder ?? {},
      userId,
    });
    return this.dashboardsRepository.save(entity);
  }

  async update(
    id: string,
    payload: Partial<DashboardEntity>,
    userId?: string,
  ): Promise<DashboardEntity> {
    const existing = await this.findOne(id, userId);

    if (payload.name !== undefined) existing.name = payload.name;
    if (payload.sectionOrder !== undefined) existing.sectionOrder = payload.sectionOrder;
    if (payload.chartsOrder !== undefined) existing.chartsOrder = payload.chartsOrder;

    return this.dashboardsRepository.save(existing);
  }

  // Метод швидкого оновлення порядку графіків конкретної секції
  async reorderSectionCharts(
    dashboardId: string,
    sectionName: string,
    chartIds: string[],
    userId?: string,
  ): Promise<DashboardEntity> {
    const dashboard = await this.findOne(dashboardId, userId);
    const currentOrder = dashboard.chartsOrder || {};
    currentOrder[sectionName] = chartIds;

    dashboard.chartsOrder = { ...currentOrder };
    return this.dashboardsRepository.save(dashboard);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await this.findOne(id, userId);
    await this.dashboardsRepository.remove(existing);
  }
}