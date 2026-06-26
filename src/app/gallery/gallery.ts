import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from '../image-item/image-item';
import { GalleryImage } from '../models/gallery-image.model';

@Component({
  selector: 'app-gallery',
  imports: [ButtonModule, CdkDrag, CdkDropList, ImageItem],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly images = signal([...galleryImages]);
  protected readonly pinnedImageIds = signal(new Set<string>());
  protected readonly visibleImages = computed(() => {
    const images = this.images();
    const pinnedImageIds = this.pinnedImageIds();

    return [
      ...images.filter((image) => pinnedImageIds.has(image.id)),
      ...images.filter((image) => !pinnedImageIds.has(image.id)),
    ];
  });
  protected readonly draggableImages = computed(() => {
    const pinnedImageIds = this.pinnedImageIds();

    return this.images().filter((image) => !pinnedImageIds.has(image.id));
  });
  protected readonly selectedImageIds = signal(new Set<string>());
  protected readonly selectedCount = computed(
    () => this.selectedImageIds().size,
  );
  protected readonly selectedCountLabel = computed(() => {
    const count = this.selectedCount();

    return count === 1
      ? '1 imagen seleccionada'
      : `${count} imagenes seleccionadas`;
  });

  protected drop(event: CdkDragDrop<GalleryImage[]>): void {
    const pinnedImageIds = this.pinnedImageIds();
    const reorderedDraggableImages = [...this.draggableImages()];

    moveItemInArray(
      reorderedDraggableImages,
      event.previousIndex,
      event.currentIndex,
    );

    this.images.update((images) => {
      let draggableImageIndex = 0;

      return images.map((image) => {
        if (pinnedImageIds.has(image.id)) {
          return image;
        }

        return reorderedDraggableImages[draggableImageIndex++];
      });
    });
  }

  protected pinImage(imageId: string): void {
    this.pinnedImageIds.update((pinnedImageIds) => {
      const nextPinnedImageIds = new Set(pinnedImageIds);

      if (nextPinnedImageIds.has(imageId)) {
        nextPinnedImageIds.delete(imageId);
      } else {
        nextPinnedImageIds.add(imageId);
      }

      return nextPinnedImageIds;
    });
  }

  protected isPinned(imageId: string): boolean {
    return this.pinnedImageIds().has(imageId);
  }

  protected isSelected(imageId: string): boolean {
    return this.selectedImageIds().has(imageId);
  }

  protected toggleSelection(imageId: string): void {
    this.selectedImageIds.update((selectedImageIds) => {
      const nextSelectedImageIds = new Set(selectedImageIds);

      if (nextSelectedImageIds.has(imageId)) {
        nextSelectedImageIds.delete(imageId);
      } else {
        nextSelectedImageIds.add(imageId);
      }

      return nextSelectedImageIds;
    });
  }

  protected deleteSelectedImages(): void {
    const selectedImageIds = this.selectedImageIds();

    if (
      selectedImageIds.size === 0 ||
      !window.confirm(`Eliminar ${this.selectedCountLabel()}?`)
    ) {
      return;
    }

    this.images.update((images) =>
      images.filter((image) => !selectedImageIds.has(image.id)),
    );
    this.pinnedImageIds.update((pinnedImageIds) => {
      const nextPinnedImageIds = new Set(pinnedImageIds);

      selectedImageIds.forEach((imageId) => nextPinnedImageIds.delete(imageId));

      return nextPinnedImageIds;
    });
    this.selectedImageIds.set(new Set<string>());
  }

  protected removeImage(imageId: string): void {
    if (!window.confirm('Eliminar imagen?')) {
      return;
    }

    this.images.update((images) =>
      images.filter((image) => image.id !== imageId),
    );
    this.selectedImageIds.update((selectedImageIds) => {
      const nextSelectedImageIds = new Set(selectedImageIds);
      nextSelectedImageIds.delete(imageId);

      return nextSelectedImageIds;
    });
    this.pinnedImageIds.update((pinnedImageIds) => {
      const nextPinnedImageIds = new Set(pinnedImageIds);
      nextPinnedImageIds.delete(imageId);

      return nextPinnedImageIds;
    });
  }
}
