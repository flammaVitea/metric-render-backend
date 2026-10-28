import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { isEmail } from 'class-validator';

import { v7 as uuidv7 } from 'uuid';

import { randomBytes } from 'crypto';
import { OrganizationEntity } from '../src/organizations/organization.entity';
import { UserEntity } from '../src/users/user.entity';

async function bootstrap() {
  const args = process.argv.slice(2);
  const orgName = args[0] || 'Default Organization';
  const email = args[1] || 'superadmin@example.com';
  const password = args[2] || 'Admin@12345';

  if (!isEmail(email)) {
    console.error('Вкажіть коректну email-адресу адміністратора');
    process.exitCode = 1;
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const orgRepo = dataSource.getRepository(OrganizationEntity);
  const userRepo = dataSource.getRepository(UserEntity);

  // 1. Генерація унікального коду організації (наприклад: ORG-A8F2K9)
  const inviteCode = `ORG-${randomBytes(3).toString('hex').toUpperCase()}`;
  const orgId = uuidv7();

  const org = orgRepo.create({
    id: orgId,
    name: orgName,
    inviteCode,
  });
  await orgRepo.save(org);

  // 2. Створення адміна зі статусом ACTIVE
  const hashedPassword = await bcrypt.hash(password, 10);
  const adminUser = userRepo.create({
    id: uuidv7(),
    email,
    password: hashedPassword,
    organizationId: org.id,
    role: 'ADMIN',
    status: 'ACTIVE',
  });
  await userRepo.save(adminUser);

  console.log('----------------------------------------------------');
  console.log(` Організація створена: ${org.name}`);
  console.log(` КОД ОРГАНІЗАЦІЇ ДЛЯ КОРИСТУВАЧІВ: [ ${inviteCode} ]`);
  console.log(` Email адміністратора: ${email}`);
  console.log('----------------------------------------------------');

  await app.close();
  process.exit(0);
}

bootstrap();