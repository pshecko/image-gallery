import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from '../image-item/image-item';
import { GalleryImage } from '../models/gallery-image.model';

@Component({
  selector: 'app-gallery',
  imports: [CdkDrag, CdkDropList, ImageItem],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly images = signal([...galleryImages]);

  protected drop(event: CdkDragDrop<GalleryImage[]>): void {
    this.images.update((images) => {
      const reorderedImages = [...images];

      moveItemInArray(
        reorderedImages,
        event.previousIndex,
        event.currentIndex,
      );

      return reorderedImages;
    });
  }

  protected removeImage(imageId: string): void {
    if (!window.confirm('Eliminar imagen?')) {
      return;
    }

    this.images.update((images) =>
      images.filter((image) => image.id !== imageId),
    );
  }
}
