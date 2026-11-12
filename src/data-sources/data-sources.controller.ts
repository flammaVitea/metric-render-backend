import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataSourceEntity } from './data-source.entity';
import { DataSourcesService } from './data-sources.service';

// Застосовуємо захист токеном до всіх методів одразу
@UseGuards(JwtAuthGuard)
@Controller(['dataSources', 'data-sources'])
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  async findAll(@Req() req: any) {
    // Отримуємо джерела даних для всієї організації
    return this.dataSourcesService.findAll(req.user.organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.dataSourcesService.findOne(id, req.user.organizationId);
  }

  @Post()
  async create(@Body() body: Partial<DataSourceEntity>, @Req() req: any) {
    return this.dataSourcesService.create(body, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user.organizationId);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.dataSourcesService.remove(id, req.user.organizationId);
    return {};
  }
}