import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
import Redis from 'ioredis';

import { v7 as uuidv7 } from 'uuid';

import { UserEntity } from '../users/user.entity';
import { OrganizationEntity } from '../organizations/organization.entity';
import { AuditLogEntity, AuditLogStatus } from './audit-log.entity';
import { AccountContext, AccountStatus } from './patterns/state/account-state';
import {
  AuthEventPublisher,
  AuditLogObserver,
  EmailNotificationObserver,
} from './patterns/observer/auth-observer';

@Injectable()
export class AuthService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME_SECONDS = 15 * 60;
  private readonly TWO_FACTOR_TTL_SECONDS = 5 * 60;
  private readonly RESET_TOKEN_TTL_SECONDS = 60 * 60;
  private readonly eventPublisher = new AuthEventPublisher();

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepo: Repository<AuditLogEntity>,
    @InjectRedis()
    private readonly redis: Redis,
  ) {
    this.eventPublisher.subscribe(new AuditLogObserver());
    this.eventPublisher.subscribe(new EmailNotificationObserver());
  }

  private async verifyCaptcha(token: string): Promise<void> {
    const secretKey = process.env.CAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.warn('CAPTCHA_SECRET_KEY не налаштовано. Перевірка пропускається.');
      return;
    }

    let data: unknown;
    try {
      const response = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret: secretKey, response: token }),
        },
      );

      if (!response.ok) {
        throw new Error(`CAPTCHA verification returned ${response.status}`);
      }

      data = await response.json();
    } catch {
      throw new BadRequestException(
        'Не вдалося зв’язатися з сервером перевірки CAPTCHA.',
      );
    }

    if (
      typeof data !== 'object' ||
      data === null ||
      !('success' in data) ||
      data.success !== true
    ) {
      throw new BadRequestException(
        'Помилка перевірки CAPTCHA. Виявлено підозрілу активність.',
      );
    }
  }

  // Вхід: забороняємо вхід, якщо заявка ще не погоджена адміном
  async login(email: string, password: string, ipAddress = 'unknown') {
    const normalizedEmail = email.trim();
    const redisKey = `login_attempts:${normalizedEmail}`;
    const attempts = await this.redis.get(redisKey);

    if (attempts && Number.parseInt(attempts, 10) >= this.MAX_ATTEMPTS) {
      let ttl = await this.redis.ttl(redisKey);
      if (ttl === -2) {
        ttl = 0;
      } else {
        if (ttl === -1) {
          await this.redis.expire(redisKey, this.LOCK_TIME_SECONDS);
          ttl = this.LOCK_TIME_SECONDS;
        }

        const user = await this.usersRepository.findOne({
          where: { email: normalizedEmail },
          select: { id: true, organizationId: true },
        });
        await this.logAttempt(
          normalizedEmail,
          'LOCKED_OUT',
          ipAddress,
          user?.organizationId ?? null,
        );
        await this.eventPublisher.notify({
          type: 'LOCKED_OUT',
          email: normalizedEmail,
          ipAddress,
          timestamp: new Date(),
        });

        throw new HttpException(
          `Забагато невдалих спроб. Спробуйте через ${Math.ceil(ttl / 60)} хвилин.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: normalizedEmail })
      .getOne();

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isPasswordValid) {
      const failures = await this.redis.incr(redisKey);
      if (failures === 1 || failures >= this.MAX_ATTEMPTS) {
        await this.redis.expire(redisKey, this.LOCK_TIME_SECONDS);
      }

      await this.logAttempt(
        normalizedEmail,
        'FAILED',
        ipAddress,
        user?.organizationId ?? null,
      );
      await this.eventPublisher.notify({
        type: 'LOGIN_FAILED',
        email: normalizedEmail,
        ipAddress,
        timestamp: new Date(),
      });
      throw new UnauthorizedException('Невірна email-адреса або пароль');
    }

    await this.redis.del(redisKey);
    new AccountContext(user.status as AccountStatus).assertCanLogin();

    if (user.isTwoFactorEnabled) {
      const otp = randomInt(100_000, 1_000_000).toString();
      const otpKey = `2fa_otp:${normalizedEmail}`;
      await this.redis.set(
        otpKey,
        otp,
        'EX',
        this.TWO_FACTOR_TTL_SECONDS,
      );
      await this.redis.del(`2fa_attempts:${normalizedEmail}`);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Код підтвердження входу (2FA)',
        html: `<h3>Ваш код підтвердження: <b>${otp}</b></h3><p>Цей код діє протягом 5 хвилин.</p>`,
      });

      return {
        requires2FA: true,
        email: user.email,
        message: 'Код підтвердження відправлено на вашу пошту.',
      };
    }

    await this.logAttempt(
      normalizedEmail,
      'SUCCESS',
      ipAddress,
      user.organizationId,
    );

    return this.generateAuthResult(user);
  }

  async verify2Fa(email: string, otp: string, ipAddress = 'unknown') {
    const normalizedEmail = email.trim();
    const attemptsKey = `2fa_attempts:${normalizedEmail}`;
    const attempts = await this.redis.get(attemptsKey);
    if (attempts && Number.parseInt(attempts, 10) >= this.MAX_ATTEMPTS) {
      throw new HttpException(
        'Забагато невдалих спроб. Запросіть новий код входу.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpKey = `2fa_otp:${normalizedEmail}`;
    const storedOtp = await this.redis.get(otpKey);
    if (!storedOtp || storedOtp !== otp) {
      const failures = await this.redis.incr(attemptsKey);
      if (failures === 1) {
        await this.redis.expire(attemptsKey, this.TWO_FACTOR_TTL_SECONDS);
      }
      throw new UnauthorizedException(
        'Невірний або прострочений код підтвердження',
      );
    }

    if ((await this.redis.getdel(otpKey)) !== otp) {
      throw new UnauthorizedException(
        'Невірний або прострочений код підтвердження',
      );
    }
    await this.redis.del(attemptsKey);

    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user || user.status !== 'ACTIVE' || !user.isTwoFactorEnabled) {
      throw new UnauthorizedException(
        'Невірний або прострочений код підтвердження',
      );
    }

    await this.logAttempt(
      normalizedEmail,
      'SUCCESS',
      ipAddress,
      user.organizationId,
    );
    return this.generateAuthResult(user);
  }

  private async generateAuthResult(user: UserEntity) {
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
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async toggle2FA(userId: string, enable: boolean) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.status !== 'ACTIVE') {
      throw new NotFoundException('Активного користувача не знайдено');
    }

    user.isTwoFactorEnabled = enable;
    await this.usersRepository.save(user);
    if (!enable) {
      await this.redis.del(`2fa_otp:${user.email}`);
      await this.redis.del(`2fa_attempts:${user.email}`);
    }

    return {
      message: `Двофакторну автентифікацію ${enable ? 'увімкнено' : 'вимкнено'}`,
    };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim();
    const genericResponse = {
      message:
        'Якщо цей email існує в системі, на нього відправлено код для скидання пароля.',
    };
    const requestKey = `reset_pw_request:${normalizedEmail}`;

    const requestStarted = await this.redis.set(
      requestKey,
      '1',
      'EX',
      60,
      'NX',
    );
    if (!requestStarted) {
      return genericResponse;
    }

    const user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (!user) {
      return genericResponse;
    }

    let resetCode: string | undefined;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = randomInt(100_000, 1_000_000).toString();
      const stored = await this.redis.set(
        `reset_pw:${candidate}`,
        user.id,
        'EX',
        this.RESET_TOKEN_TTL_SECONDS,
        'NX',
      );
      if (stored === 'OK') {
        resetCode = candidate;
        break;
      }
    }

    if (!resetCode) {
      throw new InternalServerErrorException(
        'Не вдалося створити код для скидання пароля.',
      );
    }

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Відновлення пароля',
      html: `
        <h3>Ви подали запит на скидання пароля</h3>
        <p>Ваш код для відновлення пароля:</p>
        <h2 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${resetCode}</h2>
        <p>Цей код діє 1 годину. Введіть його на сторінці відновлення разом із новим паролем.</p>
        <p>Якщо ви цього не робили, просто проігноруйте цей лист.</p>
      `,
    });

    return genericResponse;
  }

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress = 'unknown',
  ) {
    const attemptsKey = `reset_pw_attempts:${ipAddress}`;
    const attempts = await this.redis.get(attemptsKey);
    if (attempts && Number.parseInt(attempts, 10) >= this.MAX_ATTEMPTS) {
      throw new HttpException(
        'Забагато невдалих спроб. Спробуйте пізніше.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const resetKey = `reset_pw:${token}`;
    const userId = await this.redis.get(resetKey);
    if (!userId) {
      const failures = await this.redis.incr(attemptsKey);
      if (failures === 1) {
        await this.redis.expire(attemptsKey, this.LOCK_TIME_SECONDS);
      }
      throw new BadRequestException(
        'Токен недійсний або його термін дії минув.',
      );
    }

    if ((await this.redis.getdel(resetKey)) !== userId) {
      const failures = await this.redis.incr(attemptsKey);
      if (failures === 1) {
        await this.redis.expire(attemptsKey, this.LOCK_TIME_SECONDS);
      }
      throw new BadRequestException(
        'Токен недійсний або його термін дії минув.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await this.usersRepository.update(userId, {
      password: hashedPassword,
    });
    if (!result.affected) {
      throw new BadRequestException(
        'Токен недійсний або його термін дії минув.',
      );
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user) {
      await this.redis.del(
        `login_attempts:${user.email}`,
        `2fa_otp:${user.email}`,
        `2fa_attempts:${user.email}`,
      );
    }
    await this.redis.del(attemptsKey);

    return { message: 'Пароль успішно змінено. Тепер ви можете увійти.' };
  }

  async findAuditLogs(organizationId: string): Promise<AuditLogEntity[]> {
    return this.auditLogRepo.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  private async logAttempt(
    email: string,
    status: AuditLogStatus,
    ipAddress: string,
    organizationId: string | null,
  ): Promise<void> {
    const log = this.auditLogRepo.create({
      email,
      status,
      ipAddress,
      organizationId,
    });
    await this.auditLogRepo.save(log);
  }

  // Реєстрація користувача за кодом організації
  async register(
    email: string,
    password: string,
    orgCode: string,
    captchaToken: string,
  ) {
    if (!captchaToken) {
      throw new BadRequestException('Токен CAPTCHA відсутній');
    }
    await this.verifyCaptcha(captchaToken);

    const normalizedEmail = email.trim();

    // Перевірка існування коду організації
    const org = await this.orgRepository.findOne({
      where: { inviteCode: orgCode.trim().toUpperCase() },
    });
    if (!org) {
      throw new NotFoundException('Організацію за вказаним кодом не знайдено');
    }

    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim();
    const admin = configuredAdminEmail
      ? null
      : await this.usersRepository.findOne({
          where: { organizationId: org.id, role: 'ADMIN' },
        });
    const adminEmail = configuredAdminEmail || admin?.email;
    if (!adminEmail) {
      throw new InternalServerErrorException(
        'Адміністратора організації для сповіщення не знайдено',
      );
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
      role: 'MANAGER',
      status: 'PENDING', // Очікує підтвердження
    });

    await this.usersRepository.save(user);
    await this.eventPublisher.notify({
      type: 'USER_REGISTERED',
      email: user.email,
      timestamp: new Date(),
    });

    const escapedEmail = user.email.replace(/[&<>"']/g, (character) => {
      const entities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return entities[character];
    });

    await this.mailerService.sendMail({
      to: adminEmail,
      subject: 'Нова реєстрація користувача',
      html: `
        <h3>Новий запит на реєстрацію</h3>
        <p>Користувач <b>${escapedEmail}</b> зареєструвався у системі.</p>
        <p>Перейдіть в адмін-панель, щоб підтвердити або відхилити доступ.</p>
      `,
    });

    return {
      message: 'Заявку надіслано. Очікуйте підтвердження адміністратором.',
      status: 'PENDING',
    };
  }
}