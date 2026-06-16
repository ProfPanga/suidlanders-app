import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Member } from './entities/member.entity';
import { Account } from './entities/account.entity';
import { Role } from './auth/roles';

/**
 * Seed Script - default STAFF accounts (medical, security, admin).
 *
 * Members and reception are NOT seeded here:
 *  - members create their own optional recovery accounts in the app
 *  - reception uses a Pi-provisioned device token (no stored account)
 *
 * Existing staff accounts with the same email are replaced; member accounts
 * are left untouched.
 *
 * ⚠️  The default passwords below are for first-time setup only — change them.
 */

interface StaffSeed {
  email: string;
  password: string;
  role: Role;
  displayName: string;
}

const DEFAULT_PASSWORD = 'Suidlanders1!';

const staff: StaffSeed[] = [
  { email: 'admin@suidlanders.local', password: DEFAULT_PASSWORD, role: 'admin', displayName: 'Administrateur' },
  { email: 'mediese@suidlanders.local', password: DEFAULT_PASSWORD, role: 'medical', displayName: 'Mediese Personeel' },
  { email: 'sekuriteit@suidlanders.local', password: DEFAULT_PASSWORD, role: 'security', displayName: 'Sekuriteit Personeel' },
];

async function seedUsers() {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: 'data/camp.db',
    entities: [Member, Account],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('📦 Connected to SQLite database');

  const accounts = dataSource.getRepository(Account);

  console.log('\n👥 Creating default staff accounts...\n');

  for (const s of staff) {
    const email = s.email.trim().toLowerCase();
    // Replace any existing account with this email (idempotent re-seed).
    await accounts.delete({ email });

    const account = accounts.create({
      email,
      passwordHash: await bcrypt.hash(s.password, 10),
      role: s.role,
      displayName: s.displayName,
    });
    await accounts.save(account);

    console.log(`✅ ${s.role.padEnd(9)} → ${email}  (password: ${s.password})`);
  }

  console.log('\n✅ Staff accounts created.');
  console.log('⚠️  These are default credentials for first-time setup — change them before real use.\n');

  await dataSource.destroy();
  process.exit(0);
}

seedUsers().catch((error) => {
  console.error('❌ Staff seed failed:', error);
  process.exit(1);
});
