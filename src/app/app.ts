import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { logout } from './features/shared/state/app.actions';
import {
  selectCurrentUser,
  selectIsAdmin,
  selectIsAuthenticated,
} from './features/shared/state/app.reducers';

@Component({
  selector: 'app-root',
  imports: [MatButton, RouterLink, RouterLinkActive, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(Store);

  readonly currentUser = this.store.selectSignal(selectCurrentUser);
  readonly isAuthenticated = this.store.selectSignal(selectIsAuthenticated);
  readonly isAdmin = this.store.selectSignal(selectIsAdmin);

  handleLogout(): void {
    this.store.dispatch(logout());
  }
}
