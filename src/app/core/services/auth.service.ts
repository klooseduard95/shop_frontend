import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, UserProfile } from '../../features/shared/types/users.types';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly #token = signal<string | null>(localStorage.getItem('jwt'));
  readonly #currentUser = signal<UserProfile | null>(null);

  private profileRequest?: Observable<UserProfile>;

  readonly isAuthenticated = computed(() => this.#token() !== null);
  readonly currentUser = computed(() => this.#currentUser());
  readonly isAdmin = computed(() => this.#currentUser()?.role === 'ADMIN');
  readonly isCustomer = computed(() => this.#currentUser()?.role === 'CUSTOMER');

  constructor() {
    this.ensureProfile().subscribe({
      error: (error) => console.error('Failed to restore session', error),
    });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.#token.set(response.token);
        localStorage.setItem('jwt', response.token);
      }),
      switchMap((response) => this.ensureProfile().pipe(map(() => response))),
    );
  }

  ensureProfile(): Observable<UserProfile | null> {
    const currentUser = this.#currentUser();

    if (currentUser) {
      return of(currentUser);
    }

    if (!this.#token()) {
      return of(null);
    }

    if (!this.profileRequest) {
      this.profileRequest = this.http.get<UserProfile>(`${environment.apiUrl}/auth/profile`).pipe(
        tap((profile) => this.#currentUser.set(profile)),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            this.clearSession();
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this.profileRequest = undefined;
        }),
        shareReplay(1),
      );
    }

    return this.profileRequest;
  }

  async logout(): Promise<void> {
    this.clearSession();
    await this.router.navigate(['/login']);
  }

  private clearSession(): void {
    this.#token.set(null);
    this.#currentUser.set(null);
    this.profileRequest = undefined;
    localStorage.removeItem('jwt');
  }
}
