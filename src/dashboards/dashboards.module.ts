import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardEntity } from './dashboard.entity';
import { DashboardsController } from './dashboards.controller';
import { DashboardsService } from './dashboards.service';

@Module({
  imports: [TypeOrmModule.forFeature([DashboardEntity])],
  controllers: [DashboardsController],
  providers: [DashboardsService],
})
export class DashboardsModule {}
