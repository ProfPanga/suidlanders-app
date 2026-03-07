import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  private readonly ENDPOINTS = {
    sync: '/sync',
    members: '/members',
  };

  constructor(private http: HttpClient, private auth: AuthService) {}

  // Sync endpoints
  syncChanges(changes: any[]): Observable<any> {
    return this.post(`${this.ENDPOINTS.sync}/push`, { changes });
  }

  getServerChanges(lastSyncTime: number): Observable<any> {
    const params = new HttpParams().set('lastSync', lastSyncTime.toString());
    return this.get(`${this.ENDPOINTS.sync}/pull`, { params });
  }

  // Member endpoints
  createMember(memberData: any): Observable<any> {
    return this.post(this.ENDPOINTS.members, memberData);
  }

  updateMember(memberId: string, memberData: any): Observable<any> {
    return this.put(`${this.ENDPOINTS.members}/${memberId}`, memberData);
  }

  deleteMember(memberId: string): Observable<any> {
    return this.delete(`${this.ENDPOINTS.members}/${memberId}`);
  }

  getMember(memberId: string): Observable<any> {
    return this.get(`${this.ENDPOINTS.members}/${memberId}`);
  }

  getAllMembers(params?: any): Observable<any> {
    return this.get(this.ENDPOINTS.members, { params });
  }

  /**
   * Generate camp provisioning QR code
   * POST /api/auth/camp/generate-qr
   *
   * @param campId Camp identifier (optional, defaults to "default-camp")
   * @returns Observable with QR payload (serverUrls, syncCode, campId)
   */
  generateCampQR(campId?: string): Observable<any> {
    return this.post('/api/auth/camp/generate-qr', { campId: campId || 'default-camp' });
  }

  // Generic HTTP methods with error handling
  private get(path: string, options: any = {}): Observable<any> {
    const base = this.auth.getCampBaseUrl() || this.API_URL;
    return this.http
      .get(`${base}${path}`, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private post(
    path: string,
    body: any = {},
    options: any = {}
  ): Observable<any> {
    const base = this.auth.getCampBaseUrl() || this.API_URL;
    return this.http
      .post(`${base}${path}`, body, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private put(
    path: string,
    body: any = {},
    options: any = {}
  ): Observable<any> {
    const base = this.auth.getCampBaseUrl() || this.API_URL;
    return this.http
      .put(`${base}${path}`, body, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private delete(path: string, options: any = {}): Observable<any> {
    const base = this.auth.getCampBaseUrl() || this.API_URL;
    return this.http
      .delete(`${base}${path}`, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  // Add common headers
  private addHeaders(options: any = {}): any {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // Add sync token if available (for camp provisioning)
    const syncToken = this.auth.getSyncToken();
    if (syncToken) {
      headers = headers.set('Authorization', `Bearer ${syncToken}`);
    }

    return {
      ...options,
      headers: options.headers ? options.headers.append(headers) : headers,
      withCredentials: true, // If using session-based auth
    };
  }

  // Error handling
  private handleError(error: any) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.status
        ? `Error Code: ${error.status}\nMessage: ${error.message}`
        : 'Server error';
    }

    // Don't log expected 401 errors for guest pull requests
    const isExpectedGuestError =
      error.status === 401 && error.url?.includes('/api/sync/pull');

    if (!isExpectedGuestError) {
      console.error('API Error:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
