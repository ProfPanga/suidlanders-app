import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  canActivate(): boolean {
    // Check if user has a valid token
    if (this.authService.isAuthenticated()) {
      return true; // Allow access to the route
    }

    // No valid token - redirect to login
    console.log('AuthGuard: No valid token, redirecting to login');
    this.router.navigate(['/login']);
    return false; // Block access to the route
  }
}
