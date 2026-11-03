import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-view',
  imports: [MatButton, RouterLink],
  templateUrl: './not-found-view.html',
  styleUrl: './not-found-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundView {}
