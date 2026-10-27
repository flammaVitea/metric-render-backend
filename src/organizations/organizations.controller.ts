import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/roles.guard';
import { OrganizationEntity } from './organization.entity';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('organization')
export class OrganizationsController {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepo: Repository<OrganizationEntity>,
  ) {}

  @Get('my')
  async getMyOrg(@Req() req: any) {
    return this.orgRepo.findOne({ where: { id: req.user.orgId } });
  }
}