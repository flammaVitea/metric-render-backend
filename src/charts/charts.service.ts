import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { v7 as uuidv7 } from 'uuid';

import { ChartEntity } from './chart.entity';

export type ChartInput = Partial<ChartEntity> & { sourceId?: string };

@Injectable()
export class ChartsService {
  constructor(
    @InjectRepository(ChartEntity)
    private readonly chartsRepository: Repository<ChartEntity>,
  ) {}

  private normalizeSourceIds(payload: ChartInput, chartType?: string): string[] {
    let ids: string[] = [];
    if (Array.isArray(payload.sourceIds) && payload.sourceIds.length > 0) {
      ids = payload.sourceIds.filter(Boolean);
    } else if (payload.sourceId) {
      ids = [payload.sourceId];
    }

    if (ids.some((id) => !isUUID(id, 'all'))) {
      throw new BadRequestException('ID джерела даних має бути UUID');
    }

    // Для кругового графіка (pie) дозволяється лише одне джерело
    if ((chartType === 'pie' || chartType === 'doughnut') && ids.length > 1) {
      ids = [ids[0]];
    }
    return ids;
  }

  private formatChartResponse(chart: ChartEntity) {
    return {
      ...chart,
      sourceIds: Array.isArray(chart.sourceIds) ? chart.sourceIds : [],
      sourceId:
        Array.isArray(chart.sourceIds) && chart.sourceIds.length > 0
          ? chart.sourceIds[0]
          : undefined,
    };
  }

  async findAll(userId?: string, dashboardId?: string) {
    const where: Record<string, string> = {};
    if (userId) where.userId = userId;
    if (dashboardId) where.dashboardId = dashboardId;

    const charts = await this.chartsRepository.find({ where });
    return charts.map((c) => this.formatChartResponse(c));
  }

  async findOne(id: string, userId?: string) {
    const where = userId ? { id, userId } : { id };
    const chart = await this.chartsRepository.findOne({ where });
    if (!chart) {
      throw new NotFoundException(`Графік з id "${id}" не знайдено`);
    }
    return this.formatChartResponse(chart);
  }

  async create(payload: ChartInput, userId: string) {
    const id = payload.id ?? uuidv7();
    if (!isUUID(id, 'all')) {
      throw new BadRequestException('ID графіка має бути UUID');
    }
    if (!payload.dashboardId || !isUUID(payload.dashboardId, 'all')) {
      throw new BadRequestException('ID дашборда має бути UUID');
    }
    const type = payload.type ?? 'bar';
    const sourceIds = this.normalizeSourceIds(payload, type);

    const entity = this.chartsRepository.create({
      id,
      dashboardId: payload.dashboardId!,
      sourceIds,
      section: payload.section ?? null,
      title: payload.title ?? 'Новий графік',
      type,
      xAxisField: payload.xAxisField ?? null,
      yAxisField: payload.yAxisField ?? null,
      color: payload.color ?? '#1890ff',
      userId,
      refreshInterval: payload.refreshInterval ?? null,
    });

    const saved = await this.chartsRepository.save(entity);
    return this.formatChartResponse(saved);
  }

  async update(id: string, payload: ChartInput, userId?: string) {
    const where = userId ? { id, userId } : { id };
    const existing = await this.chartsRepository.findOne({ where });
    if (!existing) {
      throw new NotFoundException(`Графік з id "${id}" не знайдено`);
    }

    const nextType = payload.type ?? existing.type;
    if (payload.dashboardId !== undefined) {
      existing.dashboardId = payload.dashboardId;
    }
    if (payload.sourceIds !== undefined || payload.sourceId !== undefined) {
      existing.sourceIds = this.normalizeSourceIds(payload, nextType);
    } else if (nextType === 'pie' && existing.sourceIds.length > 1) {
      existing.sourceIds = [existing.sourceIds[0]];
    }
    if (payload.section !== undefined) existing.section = payload.section;
    if (payload.title !== undefined) existing.title = payload.title;
    if (payload.type !== undefined) existing.type = payload.type;
    if (payload.xAxisField !== undefined) {
      existing.xAxisField = payload.xAxisField;
    }
    if (payload.yAxisField !== undefined) {
      existing.yAxisField = payload.yAxisField;
    }
    if (payload.color !== undefined) existing.color = payload.color;
    
    if (payload.refreshInterval !== undefined) {
      existing.refreshInterval = payload.refreshInterval;
    }
    const saved = await this.chartsRepository.save(existing);
    return this.formatChartResponse(saved);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const where = userId ? { id, userId } : { id };
    const existing = await this.chartsRepository.findOne({ where });
    if (!existing) {
      throw new NotFoundException(`Графік з id "${id}" не знайдено`);
    }
    await this.chartsRepository.remove(existing);
  }
}
