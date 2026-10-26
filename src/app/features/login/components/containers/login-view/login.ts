import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginView } from '../../presentational/login-view/login-view';

@Component({
  imports: [LoginView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  errorMessage = signal<string | null>(null);

  loginForm = new FormGroup({
    username: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  handleLogin(): void {
    if (this.loginForm.invalid) return;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => this.errorMessage.set('Invalid credentials. Please try again.'),
    });
  }
}
