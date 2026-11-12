import { Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { UserEntity, UserStatus, UserRole } from './user.entity';

import * as bcrypt from 'bcryptjs';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const entity = this.usersRepository.create(user);
    return this.usersRepository.save(entity);
  }

  // Отримати заявки своєї організації (PENDING)
  async findPendingByOrg(organizationId: string): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { organizationId, status: 'PENDING' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Отримати всіх учасників організації (Окрім тих, хто в статусі PENDING)
  async findAllByOrg(organizationId: string): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { organizationId, status: Not('PENDING') },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  // Схвалити чи відхилити статус користувача
  async updateStatus(
    userId: string,
    organizationId: string,
    status: UserStatus,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено в цій організації');
    }

    user.status = status;
    return this.usersRepository.save(user);
  }

  async updateRole(
    userId: string,
    organizationId: string,
    role: UserRole,
    adminId: string,
    adminPassword?: string,
  ): Promise<UserEntity> {
    if (!adminPassword) {
      throw new UnauthorizedException('Потрібно ввести пароль адміністратора');
    }

    // ЗМІНЕНО: Використовуємо QueryBuilder, щоб примусово дістати приховане поле password
    const admin = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: adminId })
      .getOne();

    if (!admin || !(await bcrypt.compare(adminPassword, admin.password))) {
      throw new UnauthorizedException('Невірний пароль адміністратора');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено в цій організації');
    }

    user.role = role;
    return this.usersRepository.save(user);
  }


  // Видалити користувача з організації
  async removeUser(userId: string, organizationId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, organizationId },
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено в цій організації');
    }

    await this.usersRepository.remove(user);
  }
}
