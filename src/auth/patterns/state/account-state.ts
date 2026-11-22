import { BadRequestException, ForbiddenException } from '@nestjs/common';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

export interface AccountState {
  readonly status: AccountStatus;
  assertCanLogin(): void;
  approve(): AccountState;
  reject(): AccountState;
}

export class PendingAccountState implements AccountState {
  readonly status: AccountStatus = 'PENDING';

  assertCanLogin(): void {
    throw new ForbiddenException(
      'Ваш обліковий запис очікує підтвердження адміністратором організації.',
    );
  }

  approve(): AccountState {
    return new ActiveAccountState();
  }

  reject(): AccountState {
    return new RejectedAccountState();
  }
}

export class ActiveAccountState implements AccountState {
  readonly status: AccountStatus = 'ACTIVE';

  assertCanLogin(): void {
    // Доступ дозволено
  }

  approve(): AccountState {
    throw new BadRequestException('Обліковий запис уже активовано');
  }

  reject(): AccountState {
    return new RejectedAccountState();
  }
}

export class RejectedAccountState implements AccountState {
  readonly status: AccountStatus = 'REJECTED';

  assertCanLogin(): void {
    throw new ForbiddenException(
      'Ваш запит на приєднання до організації було відхилено.',
    );
  }

  approve(): AccountState {
    return new ActiveAccountState();
  }

  reject(): AccountState {
    throw new BadRequestException('Обліковий запис уже відхилено');
  }
}

export class AccountContext {
  private state: AccountState;

  constructor(initialStatus: AccountStatus) {
    this.state = AccountContext.fromStatus(initialStatus);
  }

  static fromStatus(status: AccountStatus): AccountState {
    switch (status) {
      case 'PENDING':
        return new PendingAccountState();
      case 'ACTIVE':
        return new ActiveAccountState();
      case 'REJECTED':
        return new RejectedAccountState();
      default:
        throw new BadRequestException(`Невідомий статус: ${status}`);
    }
  }

  get status(): AccountStatus {
    return this.state.status;
  }

  assertCanLogin(): void {
    this.state.assertCanLogin();
  }

  approve(): AccountStatus {
    this.state = this.state.approve();
    return this.state.status;
  }

  reject(): AccountStatus {
    this.state = this.state.reject();
    return this.state.status;
  }
}
