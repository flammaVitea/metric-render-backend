import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsIn } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/roles.guard';
import { UsersService } from './users.service';
import type { UserStatus } from './user.entity';

export class UpdateUserStatusDto {
  @IsIn(['ACTIVE', 'REJECTED', 'PENDING'], {
    message: 'Статус має бути ACTIVE, REJECTED або PENDING',
  })
  status: UserStatus;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findByQuery(@Query('email') email?: string) {
    if (!email) {
      return [];
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return [];
    }
    return [{ id: user.id, email: user.email }];
  }

  // Отримати список заявок на підтвердження (тільки для ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('pending')
  async getPending(@Req() req: any) {
    return this.usersService.findPendingByOrg(req.user.orgId);
  }

  // Отримати список усіх членів організації (тільки для ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('organization-members')
  async getOrgMembers(@Req() req: any) {
    return this.usersService.findAllByOrg(req.user.orgId);
  }

  // Схвалити ('ACTIVE') або відхилити ('REJECTED') заявку (тільки для ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Req() req: any,
  ) {
    return this.usersService.updateStatus(id, req.user.orgId, dto.status);
  }
}