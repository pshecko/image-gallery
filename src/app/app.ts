import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Gallery } from './gallery/gallery';

@Component({
  selector: 'app-root',
  imports: [Gallery],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
