import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginView } from './login-view';

describe('LoginView', () => {
  let component: LoginView;
  let fixture: ComponentFixture<LoginView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginView],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'form',
      new FormGroup({
        username: new FormControl('', Validators.required),
        password: new FormControl('', Validators.required),
      }),
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render validation and API errors', () => {
    component.form().controls['username'].markAsTouched();
    component.form().controls['password'].markAsTouched();
    fixture.componentRef.setInput('errorMessage', 'Invalid credentials');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Username is required.');
    expect(element.textContent).toContain('Password is required.');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Invalid credentials');
  });

  it('should disable and relabel submission while loading', () => {
    component.form().setValue({ username: 'user', password: 'password' });
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('button[type="submit"]');

    expect(button?.disabled).toBe(true);
    expect(button?.textContent).toContain('Logging in...');
  });

  it('should emit submission from the form', () => {
    const submitLogin = vi.fn();
    component.submitLogin.subscribe(submitLogin);
    component.form().setValue({ username: 'user', password: 'password' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLFormElement>('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    expect(submitLogin).toHaveBeenCalledOnce();
  });
});
