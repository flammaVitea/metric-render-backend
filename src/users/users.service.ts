import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserStatus } from './user.entity';

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

  // Отримати всіх учасників організації
  async findAllByOrg(organizationId: string): Promise<UserEntity[]> {
    return this.usersRepository.find({
      where: { organizationId },
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
}