import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../services/role.service';
import { environment } from '../../environments/environment';

/**
 * Restrict a route to the given roles.
 *
 * - Demo mode (`environment.demoMode`): honours the demo journey switcher —
 *   access is allowed when the active RoleService role is permitted. No login.
 * - Production: requires a logged-in user whose JWT role is permitted, else
 *   redirects to /login.
 *
 * Admin is treated as a superset and always allowed.
 */
export function roleGuard(allowed: UserRole[]): CanActivateFn {
  return () => {
    // Demo build is a free-roaming testing playground — no enforcement.
    if (environment.demoMode) return true;

    const router = inject(Router);
    const auth = inject(AuthService);
    const role = auth.getRole();
    if (auth.isAuthenticated() && role && (role === UserRole.ADMIN || allowed.includes(role))) {
      return true;
    }
    router.navigate(['/login']);
    return false;
  };
}
