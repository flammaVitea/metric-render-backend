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
import { ChartsService, type ChartInput } from './charts.service';

// Застосовуємо один Guard на весь контролер
@UseGuards(JwtAuthGuard)
@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get()
  async findAll(
    @Req() req: any,
    @Query('dashboardId') dashboardId?: string, // Видалили queryUserId
  ) {
    // Передаємо orgId з токена
    return this.chartsService.findAll(req.user.orgId, dashboardId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.chartsService.findOne(id, req.user.orgId);
  }

  @Post()
  async create(@Body() body: ChartInput, @Req() req: any) {
    return this.chartsService.create(body, req.user.orgId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: ChartInput,
    @Req() req: any,
  ) {
    return this.chartsService.update(id, body, req.user.orgId);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: ChartInput,
    @Req() req: any,
  ) {
    return this.chartsService.update(id, body, req.user.orgId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.chartsService.remove(id, req.user.orgId);
    return {};
  }
}