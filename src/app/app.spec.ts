import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { logout } from './core/state/auth/auth.actions';
import { UserProfile } from './features/shared/types/users.types';

describe('App', () => {
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
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
      ],
    }).compileComponents();

    store = TestBed.inject(Store) as MockStore;
    vi.spyOn(store, 'dispatch');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render login navigation for guests', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand')?.textContent).toContain('My Online Shop');
    expect(compiled.textContent).toContain('Login');
    expect(compiled.textContent).not.toContain('Cart');
    expect(compiled.textContent).not.toContain('Add product');
  });

  it('should render authenticated admin navigation and dispatch logout', () => {
    const user: UserProfile = { id: 'admin-1', username: 'admin', role: 'ADMIN' };
    store.setState({
      auth: { user, token: 'token', initialized: true, loading: false, error: null },
    });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const logoutButton = [...element.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Logout',
    );

    expect(element.textContent).toContain('admin');
    expect(element.textContent).toContain('ADMIN');
    expect(element.textContent).toContain('Cart');
    expect(element.textContent).toContain('Add product');

    logoutButton?.click();
    expect(store.dispatch).toHaveBeenCalledWith(logout());
  });
});
