import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly authService = inject(AuthService);
}
