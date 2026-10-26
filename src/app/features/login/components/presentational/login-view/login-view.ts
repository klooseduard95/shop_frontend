import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login-view',
  styleUrl: './login-view.scss',
  templateUrl: './login-view.html',
})
export class LoginView {
  form = input.required<FormGroup>();
  errorMessage = input<string | null>(null);
  submitLogin = output<void>();
}
