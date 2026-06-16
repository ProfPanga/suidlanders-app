import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Account } from '../entities/account.entity';
import { Role } from './roles';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  memberId: string | null;
}

export interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private readonly accounts: Repository<Account>,
    private readonly jwt: JwtService,
  ) {}

  /** Hash a credential secret (password or ID number). */
  async hashSecret(secret: string): Promise<string> {
    return bcrypt.hash(secret, BCRYPT_ROUNDS);
  }

  /**
   * Verify an email + secret against the accounts table.
   * `secret` is a password for staff, or the ID number for member accounts.
   * Returns the account on success, or null on any failure (no detail leaked).
   */
  async validateCredentials(email: string, secret: string): Promise<Account | null> {
    if (!email || !secret) return null;
    const account = await this.accounts.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!account) return null;
    const ok = await bcrypt.compare(secret, account.passwordHash);
    return ok ? account : null;
  }

  /** Sign a JWT carrying the account's identity + role. */
  login(account: Account): LoginResult {
    const user = this.toAuthUser(account);
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
    });
    return { accessToken, user };
  }

  /**
   * Create (or return the existing) optional member account for device recovery.
   * Idempotent per email: if the email already has an account, it is returned unchanged.
   * The credential secret is the member's ID number, bcrypt-hashed.
   */
  async createMemberAccount(email: string, idNumber: string, memberId: string): Promise<Account> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.accounts.findOne({ where: { email: normalized } });
    if (existing) return existing;

    const account = this.accounts.create({
      email: normalized,
      passwordHash: await this.hashSecret(idNumber),
      role: 'member',
      memberId,
    });
    return this.accounts.save(account);
  }

  /** Create a staff/admin account (used by seeding and the admin endpoint). */
  async createStaffAccount(
    email: string,
    password: string,
    role: Role,
    displayName?: string,
  ): Promise<Account> {
    const account = this.accounts.create({
      email: email.trim().toLowerCase(),
      passwordHash: await this.hashSecret(password),
      role,
      displayName: displayName ?? null,
    });
    return this.accounts.save(account);
  }

  /**
   * Issue a long-lived device token for the reception dashboard.
   * No human login — provisioned to the reception device by the Pi/admin.
   */
  issueDeviceToken(): { accessToken: string } {
    const accessToken = this.jwt.sign(
      { sub: 'reception-device', role: 'reception' as Role },
      { expiresIn: '30d' },
    );
    return { accessToken };
  }

  private toAuthUser(account: Account): AuthUser {
    return {
      id: account.id,
      email: account.email,
      displayName: account.displayName ?? null,
      role: account.role as Role,
      memberId: account.memberId ?? null,
    };
  }
}
