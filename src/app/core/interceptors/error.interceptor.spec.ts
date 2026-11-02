import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { logout } from '../../features/auth/state/auth.actions';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let store: MockStore;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            auth: {
              user: {
                id: 'customer-1',
                username: 'customer',
                role: 'CUSTOMER',
              },
              token: 'token',
              initialized: true,
              loading: false,
              error: null,
            },
          },
        }),
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);

    vi.spyOn(store, 'dispatch');
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  function makeRequest(status: number, statusText: string, url = '/products'): Promise<unknown> {
    const result = new Promise((resolve) => {
      http.get(url).subscribe({
        next: resolve,
        error: resolve,
      });
    });

    httpTesting.expectOne(url).flush(null, {
      status,
      statusText,
    });

    return result;
  }

  it('should dispatch logout for a protected 401 response', async () => {
    await makeRequest(401, 'Unauthorized');

    expect(store.dispatch).toHaveBeenCalledWith(logout());
    expect(consoleError).toHaveBeenCalledWith(
      '[Http Error Interceptor] Authentication is required to access this resource.',
    );
  });

  it('should not log out for a login 401 response', async () => {
    const result = new Promise((resolve) => {
      http.post('/auth/login', {}).subscribe({
        error: resolve,
      });
    });

    httpTesting.expectOne('/auth/login').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    await result;

    expect(store.dispatch).not.toHaveBeenCalledWith(logout());
    expect(consoleError).toHaveBeenCalledWith(
      '[Http Error Interceptor] Invalid username or password.',
    );
  });

  it('should recognize a login URL with query parameters and a trailing slash', async () => {
    const url = '/auth/login/?redirect=true';

    await makeRequest(401, 'Unauthorized', url);

    expect(store.dispatch).not.toHaveBeenCalledWith(logout());
    expect(consoleError).toHaveBeenCalledWith(
      '[Http Error Interceptor] Invalid username or password.',
    );
  });

  it('should report forbidden responses', async () => {
    await makeRequest(403, 'Forbidden');

    expect(consoleError).toHaveBeenCalledWith(
      '[Http Error Interceptor] You are not authorized to perform this action.',
    );
  });

  it('should report missing resources', async () => {
    await makeRequest(404, 'Not Found');

    expect(consoleError).toHaveBeenCalledWith(
      '[Http Error Interceptor] The requested resource was not found.',
    );
  });

  it('should report an unexpected server response', async () => {
    await makeRequest(500, 'Internal Server Error');

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('[Http Error Interceptor] Error Code: 500'),
    );
  });

  it('should report client-side ErrorEvent errors', async () => {
    const result = new Promise((resolve) => {
      http.get('/products').subscribe({
        error: resolve,
      });
    });

    httpTesting.expectOne('/products').error(
      new ErrorEvent('Network error', {
        message: 'Connection lost',
      }),
    );

    await result;

    expect(consoleError).toHaveBeenCalledWith('[Http Error Interceptor] Error: Connection lost');
  });

  it('should rethrow the original HTTP error', async () => {
    const errorPromise = new Promise((resolve) => {
      http.get('/products').subscribe({
        error: resolve,
      });
    });

    httpTesting.expectOne('/products').flush(null, {
      status: 404,
      statusText: 'Not Found',
    });

    await expect(errorPromise).resolves.toMatchObject({
      status: 404,
    });
  });
});
