import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  private readonly ENDPOINTS = {
    sync: '/sync',
    members: '/members'
  };

  constructor(private http: HttpClient) {}

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

  // Generic HTTP methods with error handling
  private get(path: string, options: any = {}): Observable<any> {
    return this.http.get(`${this.API_URL}${path}`, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private post(path: string, body: any = {}, options: any = {}): Observable<any> {
    return this.http.post(`${this.API_URL}${path}`, body, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private put(path: string, body: any = {}, options: any = {}): Observable<any> {
    return this.http.put(`${this.API_URL}${path}`, body, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  private delete(path: string, options: any = {}): Observable<any> {
    return this.http.delete(`${this.API_URL}${path}`, this.addHeaders(options))
      .pipe(catchError(this.handleError));
  }

  // Add common headers
  private addHeaders(options: any = {}): any {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Add any other common headers (e.g., authentication)
    });

    return {
      ...options,
      headers: options.headers ? options.headers.append(headers) : headers,
      withCredentials: true // If using session-based auth
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
      errorMessage = error.status ? 
        `Error Code: ${error.status}\nMessage: ${error.message}` :
        'Server error';
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
} 