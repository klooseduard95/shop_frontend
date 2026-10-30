import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-login-view',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatButton, MatInput],
  templateUrl: './login-view.html',
  styleUrl: './login-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginView {
  form = input.required<FormGroup>();
  errorMessage = input<string | null>(null);
  loading = input(false);
  submitLogin = output<void>();
}
