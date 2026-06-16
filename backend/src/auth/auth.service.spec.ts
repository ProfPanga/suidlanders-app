import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { Account } from '../entities/account.entity';

/**
 * Unit tests for AuthService using an in-memory fake Account repository and a
 * real JwtService.
 */
describe('AuthService', () => {
  let service: AuthService;
  let jwt: JwtService;
  let store: Account[];

  const fakeRepo = {
    create: (data: Partial<Account>) =>
      ({ id: `id-${store.length}`, createdAt: new Date(), displayName: null, memberId: null, ...data }) as Account,
    save: async (a: Account) => {
      store.push(a);
      return a;
    },
    findOne: async ({ where: { email } }: { where: { email: string } }) =>
      store.find((a) => a.email === email) ?? null,
    delete: async () => undefined,
  };

  beforeEach(async () => {
    store = [];
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '1h' } })],
      providers: [AuthService, { provide: getRepositoryToken(Account), useValue: fakeRepo }],
    }).compile();

    service = module.get(AuthService);
    jwt = module.get(JwtService);
  });

  it('validates a correct staff password and rejects wrong/unknown ones', async () => {
    await service.createStaffAccount('medic@x.local', 'secret123', 'medical', 'Med');
    expect(await service.validateCredentials('medic@x.local', 'secret123')).toBeTruthy();
    expect(await service.validateCredentials('medic@x.local', 'wrong')).toBeNull();
    expect(await service.validateCredentials('nobody@x.local', 'secret123')).toBeNull();
  });

  it('accepts the ID number as the secret for member accounts', async () => {
    await service.createMemberAccount('pieter@x.local', '7801015800081', 'member-1');
    expect(await service.validateCredentials('pieter@x.local', '7801015800081')).toBeTruthy();
    expect(await service.validateCredentials('pieter@x.local', '0000')).toBeNull();
  });

  it('createMemberAccount is idempotent per email', async () => {
    const a = await service.createMemberAccount('p@x.local', '111', 'm1');
    const b = await service.createMemberAccount('p@x.local', '222', 'm1');
    expect(b.id).toBe(a.id);
    expect(await service.validateCredentials('p@x.local', '111')).toBeTruthy();
  });

  it('login signs a JWT carrying sub, email and role', async () => {
    const acc = await service.createStaffAccount('admin@x.local', 'pw123456', 'admin', 'Admin');
    const { accessToken, user } = service.login(acc);
    expect(user.role).toBe('admin');
    const decoded = jwt.verify(accessToken) as { sub: string; email: string; role: string };
    expect(decoded.role).toBe('admin');
    expect(decoded.email).toBe('admin@x.local');
    expect(decoded.sub).toBe(acc.id);
  });

  it('issues a reception device token with role "reception"', () => {
    const { accessToken } = service.issueDeviceToken();
    expect((jwt.verify(accessToken) as { role: string }).role).toBe('reception');
  });
});
