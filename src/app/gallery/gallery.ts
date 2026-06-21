import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from '../image-item/image-item';

@Component({
  selector: 'app-gallery',
  imports: [ImageItem],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly images = signal([...galleryImages]);

  protected removeImage(imageId: string): void {
    if (!window.confirm('Eliminar imagen?')) {
      return;
    }

    this.images.update((images) =>
      images.filter((image) => image.id !== imageId),
    );
  }
}
