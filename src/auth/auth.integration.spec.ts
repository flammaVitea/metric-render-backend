import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { AuditLogEntity } from './audit-log.entity';
import { describe } from 'node:test';

describe('Backend + Database Integration Tests', () => {
  let module: TestingModule;
  let userRepo: Repository<UserEntity>;
  let auditRepo: Repository<AuditLogEntity>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [UserEntity, AuditLogEntity],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([UserEntity, AuditLogEntity]),
      ],
    }).compile();

    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    auditRepo = module.get<Repository<AuditLogEntity>>(getRepositoryToken(AuditLogEntity));
  });

  afterAll(async () => {
    await module.close();
  });

  it('IT-001: Додавання та отримання користувача з БД', async () => {
    const newUser = userRepo.create({
      id: '01933c90-0000-7000-8000-000000000001',
      email: 'integration@test.com',
      password: 'hashed_password_123',
      organizationId: 'org-1',
      role: 'MANAGER',
      status: 'PENDING',
      isTwoFactorEnabled: false,
    });
    await userRepo.save(newUser);

    const found = await userRepo.findOne({ where: { email: 'integration@test.com' } });
    expect(found).toBeDefined();
    expect(found?.status).toBe('PENDING');
    expect(found?.isTwoFactorEnabled).toBe(false);
  });

  it('IT-002: Оновлення статусу користувача (PENDING -> ACTIVE) у БД', async () => {
    await userRepo.update({ email: 'integration@test.com' }, { status: 'ACTIVE' });

    const updated = await userRepo.findOne({ where: { email: 'integration@test.com' } });
    expect(updated?.status).toBe('ACTIVE');
  });

  it('IT-003: Збереження спроби входу в журнал аудиту (audit_logs)', async () => {
    const log = auditRepo.create({
      email: 'integration@test.com',
      status: 'FAILED',
      ipAddress: '127.0.0.1',
    });
    await auditRepo.save(log);

    const logs = await auditRepo.find({ where: { email: 'integration@test.com' } });
    expect(logs.length).toBe(1);
    expect(logs[0].status).toBe('FAILED');
    expect(logs[0].ipAddress).toBe('127.0.0.1');
  });
});
