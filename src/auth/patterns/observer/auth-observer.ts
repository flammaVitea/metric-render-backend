export type AuthEventType = 'USER_REGISTERED' | 'LOGIN_FAILED' | 'LOCKED_OUT';

export interface AuthEvent {
  type: AuthEventType;
  email: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface AuthObserver {
  update(event: AuthEvent): void | Promise<void>;
}

export class AuditLogObserver implements AuthObserver {
  public readonly logs: AuthEvent[] = [];

  update(event: AuthEvent): void {
    this.logs.push(event);
  }
}

export class EmailNotificationObserver implements AuthObserver {
  public readonly sentNotifications: string[] = [];

  update(event: AuthEvent): void {
    if (event.type === 'USER_REGISTERED') {
      this.sentNotifications.push(
        `Нова заявка на реєстрацію: ${event.email}`,
      );
    } else if (event.type === 'LOCKED_OUT') {
      this.sentNotifications.push(
        `Попередження безпеки: акаунт ${event.email} тимчасово заблоковано (IP: ${event.ipAddress ?? 'unknown'})`,
      );
    }
  }
}

export class AuthEventPublisher {
  private observers: AuthObserver[] = [];

  subscribe(observer: AuthObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: AuthObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  async notify(event: AuthEvent): Promise<void> {
    for (const observer of this.observers) {
      await observer.update(event);
    }
  }
}
