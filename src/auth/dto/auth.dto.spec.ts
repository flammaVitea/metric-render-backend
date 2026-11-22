import { validate } from 'class-validator';
import {
  RegisterDto,
  LoginDto,
  Verify2FaDto,
  ResetPasswordDto,
} from './auth.dto';

describe('Auth DTOs Unit Tests', () => {
  it('1. RegisterDto: пропускає валідні дані та надійний пароль', async () => {
    const dto = new RegisterDto();
    dto.email = 'user@example.com';
    dto.password = 'StrongP@ss1';
    dto.orgCode = 'ORG-01';
    dto.captchaToken = 'valid-turnstile-token';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('2. RegisterDto: відхиляє слабкий пароль (без великої літери та спецсимволу)', async () => {
    const dto = new RegisterDto();
    dto.email = 'user@example.com';
    dto.password = 'weakpass123';
    dto.orgCode = 'ORG-01';
    dto.captchaToken = 'valid-turnstile-token';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('3. RegisterDto: відхиляє некоректний формат email', async () => {
    const dto = new RegisterDto();
    dto.email = 'invalid-email';
    dto.password = 'StrongP@ss1';
    dto.orgCode = 'ORG-01';
    dto.captchaToken = 'valid-turnstile-token';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('4. LoginDto: відхиляє порожній пароль', async () => {
    const dto = new LoginDto();
    dto.email = 'user@example.com';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('5. Verify2FaDto: приймає валідний 6-значний OTP код', async () => {
    const dto = new Verify2FaDto();
    dto.email = 'user@example.com';
    dto.otp = '123456';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('6. ResetPasswordDto: відхиляє код відновлення не з 6 цифр', async () => {
    const dto = new ResetPasswordDto();
    dto.token = '12345'; // лише 5 цифр
    dto.newPassword = 'NewStrong@2026';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'token')).toBe(true);
  });

  it('7. ResetPasswordDto: приймає 6-значний код і надійний новий пароль', async () => {
    const dto = new ResetPasswordDto();
    dto.token = '654321';
    dto.newPassword = 'NewStrong@2026';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
