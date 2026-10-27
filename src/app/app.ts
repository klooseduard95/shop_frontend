import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from './features/shared/state/app.actions';
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
  selectIsCustomer,
} from './features/shared/state/app.reducers';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly isAdmin = this.store.selectSignal(selectIsAdmin);
  readonly isCustomer = this.store.selectSignal(selectIsCustomer);

  handleLogout(): void {
    this.store.dispatch(logout());
  }
}
