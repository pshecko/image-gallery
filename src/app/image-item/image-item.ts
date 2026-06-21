import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { GalleryImage } from '../models/gallery-image.model';

@Component({
  selector: 'app-image-item',
  imports: [ButtonModule],
  templateUrl: './image-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageItem {
  readonly image = input.required<GalleryImage>();
  readonly isFeatured = input(false);
  readonly deleteImage = output<string>();

  protected onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteImage.emit(this.image().id);
  }
}
