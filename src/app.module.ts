import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChartEntity } from './charts/chart.entity';
import { ChartsModule } from './charts/charts.module';
import { DashboardEntity } from './dashboards/dashboard.entity';
import { DashboardsModule } from './dashboards/dashboards.module';
import { DataSourceEntity } from './data-sources/data-source.entity';
import { DataSourcesModule } from './data-sources/data-sources.module';
import { UserEntity } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { OrganizationEntity } from './organizations/organization.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5433),
      username: process.env.DB_USERNAME ?? 'admin', // або 'postgres' / 'metric_render_user'
      password: process.env.DB_PASSWORD ?? 'change-me', // ваш реальний пароль
      database: process.env.DB_DATABASE ?? 'my_database', // або 'metric_db' / 'metric_render'
      entities: [UserEntity, OrganizationEntity, DataSourceEntity, DashboardEntity, ChartEntity],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    DashboardsModule,
    DataSourcesModule,
    ChartsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
