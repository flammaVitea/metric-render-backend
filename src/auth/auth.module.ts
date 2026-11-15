import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/user.entity';
import { OrganizationEntity } from '../organizations/organization.entity';
import { AuditLogEntity } from './audit-log.entity';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { AdminGuard } from './roles.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([UserEntity, OrganizationEntity, AuditLogEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'metric-render-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  exports: [AuthService],
})
export class AuthModule {}