import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';
import { randomBytes } from 'crypto';

import { v7 as uuidv7 } from 'uuid';

import { UserEntity } from '../users/user.entity';
import { OrganizationEntity } from '../organizations/organization.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
    private readonly jwtService: JwtService,
  ) {}

  // Вхід: забороняємо вхід, якщо заявка ще не погоджена адміном
  async login(email?: string, password?: string) {
    if (typeof email !== 'string' || !isEmail(email.trim()) || !password) {
      throw new BadRequestException('Вкажіть коректну email-адресу та пароль');
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.trim() })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Невірна email-адреса або пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірна email-адреса або пароль');
    }

    if (user.status === 'PENDING') {
      throw new ForbiddenException(
        'Ваш обліковий запис очікує підтвердження адміністратором організації.',
      );
    }

    if (user.status === 'REJECTED') {
      throw new ForbiddenException(
        'Ваш запит на приєднання до організації було відхилено.',
      );
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      orgId: user.organizationId,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  // Реєстрація користувача за кодом організації
  async register(email?: string, password?: string, orgCode?: string) {
    if (
      typeof email !== 'string' ||
      !isEmail(email.trim()) ||
      !password ||
      !orgCode
    ) {
      throw new BadRequestException(
        'Вкажіть коректну email-адресу, пароль та код організації',
      );
    }
    const normalizedEmail = email.trim();

    // Перевірка існування коду організації
    const org = await this.orgRepository.findOne({
      where: { inviteCode: orgCode.trim().toUpperCase() },
    });
    if (!org) {
      throw new NotFoundException('Організацію за вказаним кодом не знайдено');
    }

    const existing = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existing) {
      throw new ConflictException('Користувач з такою email-адресою вже існує');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      id: uuidv7(),
      email: normalizedEmail,
      password: hashedPassword,
      organizationId: org.id,
      role: 'MEMBER',
      status: 'PENDING', // Очікує підтвердження
    });

    await this.usersRepository.save(user);

    return {
      message: 'Заявку успішно подано. Очікуйте підтвердження адміністратора організації.',
      status: 'PENDING',
    };
  }
}