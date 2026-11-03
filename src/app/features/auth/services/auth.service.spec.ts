import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should log in with the supplied credentials', () => {
    const credentials = {
      username: 'customer',
      password: 'password',
    };
    const response = { token: 'jwt-token' };

    service.login(credentials).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/login`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(credentials);

    request.flush(response);
  });

  it('should retrieve the current profile without an explicit token', () => {
    const profile = {
      id: 'user-1',
      username: 'customer',
      role: 'CUSTOMER' as const,
    };

    service.getProfile().subscribe((result) => {
      expect(result).toEqual(profile);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/profile`);

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.has('Authorization')).toBe(false);

    request.flush(profile);
  });

  it('should retrieve a profile using an explicit authorization token', () => {
    const profile = {
      id: 'user-1',
      username: 'customer',
      role: 'CUSTOMER' as const,
    };

    service.getProfile('jwt-token').subscribe((result) => {
      expect(result).toEqual(profile);
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/auth/profile`);

    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toContain('jwt-token');

    request.flush(profile);
  });

  it('should store, retrieve, and clear the persisted token', () => {
    expect(service.getStoredToken()).toBeNull();

    service.storeToken('jwt-token');

    expect(service.getStoredToken()).toBe('jwt-token');
    expect(localStorage.getItem(AuthService.tokenStorageKey)).toBe('jwt-token');

    service.clearStoredToken();

    expect(service.getStoredToken()).toBeNull();
  });
});
