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
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ChartsService, type ChartInput } from './charts.service';

@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: any,
    @Query('userId') queryUserId?: string,
    @Query('dashboardId') dashboardId?: string,
  ) {
    const userId = req.user?.userId ?? queryUserId;
    return this.chartsService.findAll(userId, dashboardId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.chartsService.findOne(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: ChartInput, @Req() req: any) {
    const userId = req.user?.userId ?? body.userId ?? 'admin';
    return this.chartsService.create(body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: ChartInput,
    @Req() req: any,
  ) {
    return this.chartsService.update(id, body, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: ChartInput,
    @Req() req: any,
  ) {
    return this.chartsService.update(id, body, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.chartsService.remove(id, req.user?.userId);
    return {};
  }
}
