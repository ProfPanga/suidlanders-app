import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { RoleService, UserRole } from './role.service';

export interface AuthUser {
  email: string;
  displayName: string | null;
  role: UserRole;
  memberId: string | null;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'auth_user';
  private readonly CAMP_BASE_URL_KEY = 'camp_base_url';
  private readonly apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.TOKEN_KEY)
      : null
  );
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private roleService: RoleService
  ) {
    // Restore the active role from a persisted session on startup.
    const user = this.currentUserSubject.value;
    if (user) this.roleService.setRole(user.role);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
          this.setUser(res.user);
          // The logged-in account's role becomes the active role.
          if (res.user?.role) this.roleService.setRole(res.user.role);
        })
      );
  }

  /**
   * Create the optional member recovery account (email + ID number).
   * Does not log the member in; it just registers the credential.
   */
  createMemberAccount(email: string, idNumber: string, memberId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/member`, { email, idNumber, memberId });
  }

  /**
   * Admin action: turn THIS device into a reception kiosk. Exchanges the admin's
   * session for a long-lived reception device token, so the device then acts as
   * 'reception' with no further login. Requires the caller to be a logged-in admin
   * (the request carries the admin JWT via the interceptor).
   */
  provisionReceptionDevice(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/auth/device`, {}).pipe(
      tap((res) => {
        this.setToken(res.accessToken);
        this.setUser({
          email: '',
          displayName: 'Ontvangs Toestel',
          role: UserRole.RECEPTION_STAFF,
          memberId: null,
        });
        this.roleService.setRole(UserRole.RECEPTION_STAFF);
      })
    );
  }

  logout(): void {
    this.setToken(null);
    this.setUser(null);
    this.roleService.setRole(UserRole.MEMBER);
  }

  // Camp sync functionality
  exchangeCampCode(code: string, campId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/camp/exchange`, {
      syncCode: code,
      campId,
    });
  }

  // Exchange against a specific base URL (used for LAN camp URLs)
  exchangeCampCodeAt(
    baseUrl: string,
    code: string,
    campId: string
  ): Observable<any> {
    return this.http.post(`${baseUrl}/api/auth/camp/exchange`, { syncCode: code, campId });
  }

  setSyncToken(token: string | null): void {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem('camp_sync_token', token);
      else localStorage.removeItem('camp_sync_token');
    }
  }

  getSyncToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('camp_sync_token');
    }
    return null;
  }

  setCampBaseUrl(url: string | null): void {
    if (typeof localStorage !== 'undefined') {
      if (url) localStorage.setItem(this.CAMP_BASE_URL_KEY, url);
      else localStorage.removeItem(this.CAMP_BASE_URL_KEY);
    }
  }

  getCampBaseUrl(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.CAMP_BASE_URL_KEY);
    }
    return null;
  }

  private setToken(token: string | null) {
    if (typeof localStorage !== 'undefined') {
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      else localStorage.removeItem(this.TOKEN_KEY);
    }
    this.tokenSubject.next(token);
  }

  private setUser(user: AuthUser | null) {
    if (typeof localStorage !== 'undefined') {
      if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
