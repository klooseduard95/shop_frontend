import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatButton, MatInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login-view',
  styleUrl: './login-view.scss',
  templateUrl: './login-view.html',
})
export class LoginView {
  form = input.required<FormGroup>();
  errorMessage = input<string | null>(null);
  loading = input(false);
  submitLogin = output<void>();
}
