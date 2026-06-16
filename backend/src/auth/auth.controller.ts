import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { Role, STAFF_ROLES } from './roles';

/**
 * Auth Controller - login + account creation.
 *
 * - POST /api/auth/login   public; staff use a password, members use their ID number
 * - POST /api/auth/member  public; creates the optional member recovery account
 * - POST /api/auth/device  admin only; issues the reception device token
 * - POST /api/auth/users   admin only; creates staff accounts
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email?: string; password?: string }) {
    const account = await this.auth.validateCredentials(body.email ?? '', body.password ?? '');
    if (!account) {
      throw new UnauthorizedException('Ongeldige e-pos of wagwoord');
    }
    return this.auth.login(account);
  }

  @Post('member')
  @HttpCode(HttpStatus.CREATED)
  async createMember(@Body() body: { email?: string; idNumber?: string; memberId?: string }) {
    if (!body.email || !body.idNumber || !body.memberId) {
      throw new BadRequestException('email, idNumber and memberId are required');
    }
    const account = await this.auth.createMemberAccount(body.email, body.idNumber, body.memberId);
    return {
      id: account.id,
      email: account.email,
      role: account.role,
      memberId: account.memberId,
    };
  }

  @Post('device')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  issueDevice() {
    return this.auth.issueDeviceToken();
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createUser(
    @Body() body: { email?: string; password?: string; role?: Role; displayName?: string },
  ) {
    if (!body.email || !body.password || !body.role) {
      throw new BadRequestException('email, password and role are required');
    }
    if (!STAFF_ROLES.includes(body.role)) {
      throw new BadRequestException(`role must be one of: ${STAFF_ROLES.join(', ')}`);
    }
    const account = await this.auth.createStaffAccount(
      body.email,
      body.password,
      body.role,
      body.displayName,
    );
    return { id: account.id, email: account.email, role: account.role };
  }
}
