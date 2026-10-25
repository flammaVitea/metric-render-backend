import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { DashboardEntity } from './dashboard.entity';

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
    const id = payload.id || randomBytes(8).toString('base64url').slice(0, 11);
    const entity = this.dashboardsRepository.create({
      id,
      name: payload.name ?? 'Новий дашборд',
      sectionOrder: Array.isArray(payload.sectionOrder)
        ? payload.sectionOrder
        : [],
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
    if (payload.sectionOrder !== undefined) {
      existing.sectionOrder = payload.sectionOrder;
    }

    return this.dashboardsRepository.save(existing);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await this.findOne(id, userId);
    await this.dashboardsRepository.remove(existing);
  }
}
