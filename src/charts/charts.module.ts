import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartEntity } from './chart.entity';
import { ChartsController } from './charts.controller';
import { ChartsService } from './charts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChartEntity])],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
