import {
  AuthEventPublisher,
  AuditLogObserver,
  EmailNotificationObserver,
} from './auth-observer';

describe('Observer Pattern: AuthEventPublisher', () => {
  it('1. Сповіщає всіх підписаних спостерігачів про подію USER_REGISTERED', async () => {
    const publisher = new AuthEventPublisher();
    const auditObserver = new AuditLogObserver();
    const emailObserver = new EmailNotificationObserver();

    publisher.subscribe(auditObserver);
    publisher.subscribe(emailObserver);

    await publisher.notify({
      type: 'USER_REGISTERED',
      email: 'newuser@test.com',
      timestamp: new Date(),
    });

    expect(auditObserver.logs.length).toBe(1);
    expect(emailObserver.sentNotifications.length).toBe(1);
    expect(emailObserver.sentNotifications[0]).toContain('newuser@test.com');
  });

  it('2. Подія LOGIN_FAILED записується в аудит, але не шле email-сповіщення', async () => {
    const publisher = new AuthEventPublisher();
    const auditObserver = new AuditLogObserver();
    const emailObserver = new EmailNotificationObserver();

    publisher.subscribe(auditObserver);
    publisher.subscribe(emailObserver);

    await publisher.notify({
      type: 'LOGIN_FAILED',
      email: 'user@test.com',
      ipAddress: '127.0.0.1',
      timestamp: new Date(),
    });

    expect(auditObserver.logs.length).toBe(1);
    expect(emailObserver.sentNotifications.length).toBe(0);
  });

  it('3. Подія LOCKED_OUT фіксується в аудиті та надсилає попередження безпеки', async () => {
    const publisher = new AuthEventPublisher();
    const auditObserver = new AuditLogObserver();
    const emailObserver = new EmailNotificationObserver();

    publisher.subscribe(auditObserver);
    publisher.subscribe(emailObserver);

    await publisher.notify({
      type: 'LOCKED_OUT',
      email: 'victim@test.com',
      ipAddress: '192.168.1.10',
      timestamp: new Date(),
    });

    expect(auditObserver.logs.length).toBe(1);
    expect(emailObserver.sentNotifications.length).toBe(1);
    expect(emailObserver.sentNotifications[0]).toContain('192.168.1.10');
  });

  it('4. Відписаний спостерігач (unsubscribe) більше не отримує події', async () => {
    const publisher = new AuthEventPublisher();
    const auditObserver = new AuditLogObserver();

    publisher.subscribe(auditObserver);
    publisher.unsubscribe(auditObserver);

    await publisher.notify({
      type: 'USER_REGISTERED',
      email: 'ignored@test.com',
      timestamp: new Date(),
    });

    expect(auditObserver.logs.length).toBe(0);
  });
});
