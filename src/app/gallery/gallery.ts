import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';

import { galleryImages } from '../data/gallery-images';
import { ImageItem, MoveDirection } from '../image-item/image-item';
import { GalleryImage } from '../models/gallery-image.model';

@Component({
  selector: 'app-gallery',
  imports: [ButtonModule, CdkDrag, CdkDropList, ImageItem],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly images = signal([...galleryImages]);
  protected readonly visibleImages = computed(() => this.images());
  protected readonly selectedImageIds = signal(new Set<string>());
  protected readonly selectedCount = computed(() => this.selectedImageIds().size);
  protected readonly selectedCountLabel = computed(() => {
    const count = this.selectedCount();

    return count === 1 ? '1 imagen seleccionada' : `${count} imagenes seleccionadas`;
  });

  protected drop(event: CdkDragDrop<GalleryImage[]>): void {
    this.images.update((images) => {
      const reorderedImages = [...images];

      moveItemInArray(reorderedImages, event.previousIndex, event.currentIndex);

      return reorderedImages;
    });
  }

  protected moveImage(imageId: string, direction: MoveDirection): void {
    this.images.update((images) => {
      const currentIndex = images.findIndex((image) => image.id === imageId);
      const nextIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex === -1 || nextIndex < 0 || nextIndex >= images.length) {
        return images;
      }

      const reorderedImages = [...images];

      moveItemInArray(reorderedImages, currentIndex, nextIndex);

      return reorderedImages;
    });
  }

  protected canMovePrevious(imageIndex: number): boolean {
    return imageIndex > 0;
  }

  protected canMoveNext(imageIndex: number): boolean {
    return imageIndex < this.visibleImages().length - 1;
  }

  protected isFeatured(imageIndex: number): boolean {
    return imageIndex === 0;
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

    if (selectedImageIds.size === 0 || !window.confirm(`Eliminar ${this.selectedCountLabel()}?`)) {
      return;
    }

    this.images.update((images) => images.filter((image) => !selectedImageIds.has(image.id)));
    this.selectedImageIds.set(new Set<string>());
  }

  protected removeImage(imageId: string): void {
    if (!window.confirm('Eliminar imagen?')) {
      return;
    }

    this.images.update((images) => images.filter((image) => image.id !== imageId));
    this.selectedImageIds.update((selectedImageIds) => {
      const nextSelectedImageIds = new Set(selectedImageIds);
      nextSelectedImageIds.delete(imageId);

      return nextSelectedImageIds;
    });
  }
}
