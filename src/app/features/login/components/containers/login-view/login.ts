import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginView } from '../../presentational/login-view/login-view';
import { Store } from '@ngrx/store';
import { login } from '../../../../shared/state/app.actions';
import { selectAuthError, selectAuthLoading } from '../../../../shared/state/app.reducers';

@Component({
  imports: [LoginView],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly store = inject(Store);

  readonly errorMessage = this.store.selectSignal(selectAuthError);
  readonly loading = this.store.selectSignal(selectAuthLoading);

  loginForm = new FormGroup({
    username: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl('', { validators: [Validators.required], nonNullable: true }),
  });

  handleLogin(): void {
    if (this.loginForm.invalid) return;

    this.store.dispatch(login({ credentials: this.loginForm.getRawValue() }));
  }
}
