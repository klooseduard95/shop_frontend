import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthResponse, LoginRequest, UserProfile } from '../../features/shared/types/users.types';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials);
  }

  getProfile(token?: string): Observable<UserProfile> {
    const options = token
      ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
      : undefined;
    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`, options);
  }

  getStoredToken(): string | null {
    return localStorage.getItem('jwt');
  }

  storeToken(token: string): void {
    localStorage.setItem('jwt', token);
  }

  clearStoredToken(): void {
    localStorage.removeItem('jwt');
  }
}
