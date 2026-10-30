import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { provideMockStore } from '@ngrx/store/testing';
import { Store } from '@ngrx/store';
import { login } from '../../../../../core/state/auth/auth.actions';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
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
      ],
    }).compileComponents();

    store = TestBed.inject(Store);
    vi.spyOn(store, 'dispatch');
    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch login for valid credentials', () => {
    component.loginForm.setValue({ username: 'user', password: 'password' });

    component.handleLogin();

    expect(store.dispatch).toHaveBeenCalledWith(
      login({ credentials: { username: 'user', password: 'password' } }),
    );
  });
});
