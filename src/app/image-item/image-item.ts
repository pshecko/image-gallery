import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { GalleryImage } from '../models/gallery-image.model';

@Component({
  selector: 'app-image-item',
  templateUrl: './image-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageItem {
  readonly image = input.required<GalleryImage>();
  readonly isFeatured = input(false);
}
