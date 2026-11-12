import {
  Body,
  Controller,
  Delete,
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
import type { UserRole, UserStatus } from './user.entity';

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

    // ЗМІНА РОЛІ (Тільки для ADMIN)
  // ЗМІНА РОЛІ (Тільки для ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch(':id/role')
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @Body('adminPassword') adminPassword: string, // <-- Додано отримання пароля з тіла запиту
    @Req() req: any,
  ) {
    // Передаємо req.user.userId (це ID самого адміна) та adminPassword
    return this.usersService.updateRole(id, req.user.orgId, role, req.user.userId, adminPassword);
  }


  // ВИДАЛЕННЯ КОРИСТУВАЧА (Тільки для ADMIN)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  async removeUser(@Param('id') id: string, @Req() req: any) {
    await this.usersService.removeUser(id, req.user.orgId);
    return { success: true };
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