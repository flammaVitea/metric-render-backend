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
import { DashboardEntity } from './dashboard.entity';
import { DashboardsService } from './dashboards.service';

// Зверніть увагу: ми залишаємо тільки JwtAuthGuard, щоб всі ролі (навіть Менеджер) мали доступ
@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  async findAll(@Req() req: any) {
    console.log('--- ЗАПИТ ДАШБОРДІВ ---');
    console.log('Email:', req.user.email);
    console.log('Роль:', req.user.role);
    console.log('orgId з токена:', req.user.orgId);
    
    return this.dashboardsService.findAll(req.user.orgId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.dashboardsService.findOne(id, req.user.orgId);
  }

  @Post()
  async create(@Body() body: Partial<DashboardEntity>, @Req() req: any) {
    return this.dashboardsService.create(body, req.user.orgId);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<DashboardEntity>,
    @Req() req: any,
  ) {
    return this.dashboardsService.update(id, body, req.user.orgId);
  }

  @Patch(':id/reorder-charts')
  async reorderCharts(
    @Param('id') id: string,
    @Body() body: { sectionName: string; chartIds: string[] },
    @Req() req: any,
  ) {
    return this.dashboardsService.reorderSectionCharts(
      id,
      body.sectionName,
      body.chartIds,
      req.user.orgId,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<DashboardEntity>,
    @Req() req: any,
  ) {
    return this.dashboardsService.update(id, body, req.user.orgId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.dashboardsService.remove(id, req.user.orgId);
    return {};
  }

  @Patch(':id/layout')
  async updateLayout(
    @Param('id') id: string,
    @Body() body: { sectionName: string; items: { id: string; span: number }[] },
    @Req() req: any,
  ) {
    return this.dashboardsService.updateSectionLayout(
      id,
      body.sectionName,
      body.items,
      req.user.orgId,
    );
  }
}