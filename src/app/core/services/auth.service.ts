import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, UserProfile } from '../../features/shared/types/users.types';
import { catchError, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly #token = signal<string | null>(localStorage.getItem('jwt'));
  readonly #currentUser = signal<UserProfile | null>(null);

  readonly isAuthenticated = computed(() => this.#token() !== null);
  readonly currentUser = computed(() => this.#currentUser());
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'ADMIN');
  readonly isCustomer = computed(() => this.#currentUser()?.role === 'CUSTOMER');

  constructor() {
    if (this.#token()) {
      this.loadProfile().subscribe({
        error: (error) => console.error('Failed to restore user session', error),
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.#token.set(response.token);
        localStorage.setItem('jwt', response.token);
      }),
      switchMap((response) => this.loadProfile().pipe(map(() => response))),
    );
  }

  async logout(): Promise<void> {
    this.clearSession();
    await this.router.navigate(['/login']);
  }

  private clearSession(): void {
    this.#token.set(null);
    this.#currentUser.set(null);
    localStorage.removeItem('jwt');
  }

  private loadProfile(): Observable<UserProfile | null> {
    if (!this.#token()) {
      return of(null);
    }

    return this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).pipe(
      tap((profile) => this.#currentUser.set(profile)),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }
}
