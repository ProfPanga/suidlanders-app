import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly CAMP_BASE_URL_KEY = 'camp_base_url';
  private readonly apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.TOKEN_KEY)
      : null
  );

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this.setToken(res.accessToken);
        })
      );
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { email, password });
  }

  logout(): void {
    this.setToken(null);
  }

  // Camp sync functionality
  exchangeCampCode(code: string, campId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/camp/exchange`, {
      code,
      campId,
    });
  }

  // Exchange against a specific base URL (used for LAN camp URLs)
  exchangeCampCodeAt(
    baseUrl: string,
    code: string,
    campId: string
  ): Observable<any> {
    return this.http.post(`${baseUrl}/auth/camp/exchange`, { code, campId });
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
}
