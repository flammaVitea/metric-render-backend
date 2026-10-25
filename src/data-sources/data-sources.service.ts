import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { DataSourceEntity } from './data-source.entity';

@Injectable()
export class DataSourcesService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly dataSourcesRepository: Repository<DataSourceEntity>,
  ) {}

  async findAll(userId?: string): Promise<DataSourceEntity[]> {
    if (userId) {
      return this.dataSourcesRepository.find({ where: { userId } });
    }
    return this.dataSourcesRepository.find();
  }

  async findOne(id: string, userId?: string): Promise<DataSourceEntity> {
    const where = userId ? { id, userId } : { id };
    const source = await this.dataSourcesRepository.findOne({ where });
    if (!source) {
      throw new NotFoundException(`Джерело даних з id "${id}" не знайдено`);
    }
    return source;
  }

  async create(
    payload: Partial<DataSourceEntity>,
    userId: string,
  ): Promise<DataSourceEntity> {
    const id = payload.id || randomBytes(8).toString('base64url').slice(0, 11);
    const entity = this.dataSourcesRepository.create({
      id,
      name: payload.name,
      type: payload.type ?? 'rest',
      urlOrPath: payload.urlOrPath ?? '',
      status: payload.status ?? 'pending',
      lastSync: payload.lastSync ? new Date(payload.lastSync) : new Date(),
      visibleFields: Array.isArray(payload.visibleFields)
        ? payload.visibleFields
        : null,
      hiddenFields: Array.isArray(payload.hiddenFields)
        ? payload.hiddenFields
        : null,
      userId,
    });
    return this.dataSourcesRepository.save(entity);
  }

  async update(
    id: string,
    payload: Partial<DataSourceEntity>,
    userId?: string,
  ): Promise<DataSourceEntity> {
    const existing = await this.findOne(id, userId);

    if (payload.name !== undefined) existing.name = payload.name;
    if (payload.type !== undefined) existing.type = payload.type;
    if (payload.urlOrPath !== undefined) existing.urlOrPath = payload.urlOrPath;
    if (payload.status !== undefined) existing.status = payload.status;
    if (payload.lastSync !== undefined) {
      existing.lastSync = payload.lastSync ? new Date(payload.lastSync) : null;
    }
    if (payload.visibleFields !== undefined) {
      existing.visibleFields = payload.visibleFields;
    }
    if (payload.hiddenFields !== undefined) {
      existing.hiddenFields = payload.hiddenFields;
    }

    return this.dataSourcesRepository.save(existing);
  }

  async remove(id: string, userId?: string): Promise<void> {
    const existing = await this.findOne(id, userId);
    await this.dataSourcesRepository.remove(existing);
  }
}
