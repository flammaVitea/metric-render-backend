import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AccountContext } from './account-state';

describe('State Pattern: AccountContext', () => {
  it('1. PENDING: забороняє вхід (ForbiddenException)', () => {
    const account = new AccountContext('PENDING');
    expect(() => account.assertCanLogin()).toThrow(ForbiddenException);
  });

  it('2. PENDING -> ACTIVE: успішне підтвердження та дозвіл на вхід', () => {
    const account = new AccountContext('PENDING');
    const nextStatus = account.approve();

    expect(nextStatus).toBe('ACTIVE');
    expect(() => account.assertCanLogin()).not.toThrow();
  });

  it('3. ACTIVE: повторне підтвердження викликає помилку (BadRequestException)', () => {
    const account = new AccountContext('ACTIVE');
    expect(() => account.approve()).toThrow(BadRequestException);
  });

  it('4. PENDING -> REJECTED: відхилення забороняє вхід', () => {
    const account = new AccountContext('PENDING');
    const nextStatus = account.reject();

    expect(nextStatus).toBe('REJECTED');
    expect(() => account.assertCanLogin()).toThrow(ForbiddenException);
  });

  it('5. REJECTED: повторне відхилення викликає помилку (BadRequestException)', () => {
    const account = new AccountContext('REJECTED');
    expect(() => account.reject()).toThrow(BadRequestException);
  });
});
