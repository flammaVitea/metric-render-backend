import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

import { v7 as uuidv7 } from 'uuid';

import { DataSourceEntity } from './data-source.entity';

import * as fs from 'fs';
import * as path from 'path';
import csv = require('csv-parser');



@Injectable()
export class DataSourcesService {
  constructor(
    @InjectRepository(DataSourceEntity)
    private readonly dataSourcesRepository: Repository<DataSourceEntity>,
  ) {}

  async findAll(organizationId?: string): Promise<DataSourceEntity[]> {
    if (organizationId) {
      return this.dataSourcesRepository.find({ where: { organizationId } });
    }
    return this.dataSourcesRepository.find();
  }

  async findOne(id: string, organizationId?: string): Promise<DataSourceEntity> {
    const where = organizationId ? { id, organizationId } : { id };
    const source = await this.dataSourcesRepository.findOne({ where });
    if (!source) {
      throw new NotFoundException(`Джерело даних з id "${id}" не знайдено`);
    }
    return source;
  }

  async create(
    payload: Partial<DataSourceEntity>,
    organizationId: string, // <-- Цей параметр має прийти з контролера
  ): Promise<DataSourceEntity> {
    const id = payload.id ?? uuidv7();
    if (!isUUID(id, 'all')) {
      throw new BadRequestException('ID джерела даних має бути UUID');
    }
    
    // Переконайтеся, що organizationId додається до entity
    const entity = this.dataSourcesRepository.create({
      id,
      name: payload.name,
      type: payload.type ?? 'rest',
      urlOrPath: payload.urlOrPath ?? '',
      status: payload.status ?? 'pending',
      lastSync: payload.lastSync ? new Date(payload.lastSync) : new Date(),
      visibleFields: Array.isArray(payload.visibleFields) ? payload.visibleFields : null,
      hiddenFields: Array.isArray(payload.hiddenFields) ? payload.hiddenFields : null,
      organizationId: organizationId,
    });
    
    return this.dataSourcesRepository.save(entity);
  }


  async update(
    id: string,
    payload: Partial<DataSourceEntity>,
    organizationId?: string,
  ): Promise<DataSourceEntity> {
    const existing = await this.findOne(id, organizationId);

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

  async remove(id: string, organizationId?: string): Promise<void> {
    const existing = await this.findOne(id, organizationId);
    await this.dataSourcesRepository.remove(existing);
  }

  async saveUploadedCsv(file: Express.Multer.File, orgId: string) {
    // 1. Створюємо ізольовану директорію для організації (наприклад: uploads/01a1c490-...)
    const uploadDir = path.join(process.cwd(), 'uploads', orgId);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Генеруємо безпечну назву файлу замість оригінальної
    const safeFilename = `${uuidv7()}.csv`;
    const filePath = path.join(uploadDir, safeFilename);

    // 3. Зберігаємо файл на диск
    if (!file.buffer) {
      throw new BadRequestException('Не вдалося прочитати завантажений файл');
    }
    fs.writeFileSync(filePath, file.buffer);

    // 4. Повертаємо відносний шлях, який фронтенд запише у urlOrPath
    return { path: `uploads/${orgId}/${safeFilename}` };
  }

  async readCsvData(filePath: string): Promise<any[]> {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('CSV файл не знайдено');
    }

    // Додано тип для масиву
    const results: Record<string, any>[] = [];
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(fullPath)
        .pipe(csv())
        .on('data', (data) => {
          // Додано тип для об'єкта, щоб TypeScript дозволив записувати значення за строковим ключем
          const sanitizedRow: Record<string, any> = {};
          
          for (const [key, value] of Object.entries(data)) {
            let safeValue = value as string;
            if (typeof safeValue === 'string' && /^[=+\-@\t\r]/.test(safeValue)) {
              safeValue = "'" + safeValue;
            }
            sanitizedRow[key] = safeValue;
          }
          results.push(sanitizedRow);
        })
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

    // Додайте цей метод у DataSourcesService
  async getSourceData(id: string, organizationId: string): Promise<any[]> {
    const source = await this.findOne(id, organizationId);

    if (source.type === 'csv') {
      if (!source.urlOrPath) {
        throw new BadRequestException('Шлях до CSV файлу порожній');
      }
      // Викликаємо наш безпечний метод читання
      return this.readCsvData(source.urlOrPath);
    }

    if (source.type === 'rest') {
      throw new BadRequestException('REST API джерела повинні оброблятися на фронтенді (або додайте axios на бекенд)');
    }

    throw new BadRequestException('Невідомий тип джерела даних');
  }


}
