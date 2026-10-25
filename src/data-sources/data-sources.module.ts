import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceEntity } from './data-source.entity';
import { DataSourcesController } from './data-sources.controller';
import { DataSourcesService } from './data-sources.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataSourceEntity])],
  controllers: [DataSourcesController],
  providers: [DataSourcesService],
})
export class DataSourcesModule {}
