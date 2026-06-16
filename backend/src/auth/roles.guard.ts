import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles';

/**
 * Enforces @Roles(...). Must run AFTER JwtAuthGuard so `req.user` is populated.
 * Allows the request only if the token's role is in the route's allowed list.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const role: Role | undefined = context.switchToHttp().getRequest().user?.role;
    if (role && required.includes(role)) return true;

    throw new ForbiddenException('Insufficient role for this resource');
  }
}
