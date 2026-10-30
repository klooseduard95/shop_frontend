import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: {
            auth: {
              user: null,
              token: null,
              initialized: true,
              loading: false,
              error: null,
            },
          },
        }),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(MockStore);
  });

  afterEach(() => httpTesting.verify());

  it('should add the store token as a bearer header', () => {
    store.setState({
      auth: {
        user: null,
        token: 'token',
        initialized: true,
        loading: false,
        error: null,
      },
    });

    http.get('/resource').subscribe();

    const request = httpTesting.expectOne('/resource');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token');
    request.flush({});
  });

  it('should leave requests unauthenticated when the store has no token', () => {
    http.get('/resource').subscribe();

    const request = httpTesting.expectOne('/resource');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('should preserve an explicitly supplied authorization header', () => {
    store.setState({
      auth: {
        user: null,
        token: 'store-token',
        initialized: true,
        loading: false,
        error: null,
      },
    });

    http
      .get('/resource', {
        headers: { Authorization: 'Bearer request-token' },
      })
      .subscribe();

    const request = httpTesting.expectOne('/resource');
    expect(request.request.headers.get('Authorization')).toBe('Bearer request-token');
    request.flush({});
  });
});
