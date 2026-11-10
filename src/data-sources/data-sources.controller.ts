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
import { DataSourceEntity } from './data-source.entity';
import { DataSourcesService } from './data-sources.service';

@Controller(['dataSources', 'data-sources'])
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() req: any, @Query('userId') queryUserId?: string) {
    const userId = req.user?.userId ?? queryUserId;
    return this.dataSourcesService.findAll(userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.dataSourcesService.findOne(id, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: Partial<DataSourceEntity>, @Req() req: any) {
    const userId = req.user.userId;
    return this.dataSourcesService.create(body, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.dataSourcesService.remove(id, req.user?.userId);
    return {};
  }
}
