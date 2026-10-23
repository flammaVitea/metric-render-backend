import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { ChartsModule } from './charts/charts.module';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [AuthModule, UsersModule, DashboardsModule, DataSourcesModule, ChartsModule],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
