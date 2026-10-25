import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardEntity } from './dashboard.entity';
import { DashboardsService } from './dashboards.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  async findAll(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.userId ?? queryUserId;
    return this.dashboardsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.dashboardsService.findOne(id, req.user?.userId);
  }

  @Post()
  async create(@Body() body: Partial<DashboardEntity>, @Req() req: any) {
    const userId = req.user?.userId ?? body.userId ?? 'admin';
    return this.dashboardsService.create(body, userId);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<DashboardEntity>,
    @Req() req: any,
  ) {
    return this.dashboardsService.update(id, body, req.user?.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<DashboardEntity>,
    @Req() req: any,
  ) {
    return this.dashboardsService.update(id, body, req.user?.userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.dashboardsService.remove(id, req.user?.userId);
    return {};
  }
}
