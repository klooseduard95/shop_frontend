import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NotFoundView } from '../../presentational/not-found-view/not-found-view';

@Component({
  selector: 'app-not-found',
  imports: [NotFoundView],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
