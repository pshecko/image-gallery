import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ButtonModule } from 'primeng/button';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from '../image-item/image-item';
import { GalleryImage } from '../models/gallery-image.model';

function toggleImageId(imageIds: ReadonlySet<string>, imageId: string): Set<string> {
  const nextImageIds = new Set(imageIds);

  if (nextImageIds.has(imageId)) {
    nextImageIds.delete(imageId);
  } else {
    nextImageIds.add(imageId);
  }

  return nextImageIds;
}

function addImageIds(imageIds: ReadonlySet<string>, imageIdsToAdd: Iterable<string>): Set<string> {
  const nextImageIds = new Set(imageIds);

  for (const imageId of imageIdsToAdd) {
    nextImageIds.add(imageId);
  }

  return nextImageIds;
}

function deleteImageIds(
  imageIds: ReadonlySet<string>,
  imageIdsToDelete: Iterable<string>,
): Set<string> {
  const nextImageIds = new Set(imageIds);

  for (const imageId of imageIdsToDelete) {
    nextImageIds.delete(imageId);
  }

  return nextImageIds;
}

@Component({
  selector: 'app-gallery',
  imports: [ButtonModule, CdkDrag, CdkDropList, ImageItem],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  protected readonly images = signal([...galleryImages]);
  protected readonly featuredImageIds = signal(new Set<string>());
  protected readonly visibleImages = computed(() => {
    const images = this.images();
    const featuredImageIds = this.featuredImageIds();

    return [
      ...images.filter((image) => featuredImageIds.has(image.id)),
      ...images.filter((image) => !featuredImageIds.has(image.id)),
    ];
  });
  protected readonly draggableImages = computed(() => {
    const featuredImageIds = this.featuredImageIds();

    return this.images().filter((image) => !featuredImageIds.has(image.id));
  });
  protected readonly selectedImageIds = signal(new Set<string>());
  protected readonly selectedCount = computed(() => this.selectedImageIds().size);
  protected readonly selectedCountLabel = computed(() => {
    const count = this.selectedCount();

    return count === 1 ? '1 imagen seleccionada' : `${count} imagenes seleccionadas`;
  });

  protected drop(event: CdkDragDrop<GalleryImage[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    const featuredImageIds = this.featuredImageIds();
    const reorderedDraggableImages = [...this.draggableImages()];

    moveItemInArray(reorderedDraggableImages, event.previousIndex, event.currentIndex);

    this.images.update((images) => {
      let draggableImageIndex = 0;

      return images.map((image) => {
        if (featuredImageIds.has(image.id)) {
          return image;
        }

        return reorderedDraggableImages[draggableImageIndex++];
      });
    });
  }

  protected toggleFeaturedImage(imageId: string): void {
    this.featuredImageIds.update((featuredImageIds) => toggleImageId(featuredImageIds, imageId));
  }

  protected featureSelectedImages(): void {
    const selectedImageIds = this.selectedImageIds();

    if (selectedImageIds.size === 0) {
      return;
    }

    this.featuredImageIds.update((featuredImageIds) =>
      addImageIds(featuredImageIds, selectedImageIds),
    );
  }

  protected isFeatured(imageId: string): boolean {
    return this.featuredImageIds().has(imageId);
  }

  protected isSelected(imageId: string): boolean {
    return this.selectedImageIds().has(imageId);
  }

  protected toggleSelection(imageId: string): void {
    this.selectedImageIds.update((selectedImageIds) => toggleImageId(selectedImageIds, imageId));
  }

  protected deleteSelectedImages(): void {
    const selectedImageIds = this.selectedImageIds();

    if (selectedImageIds.size === 0 || !window.confirm(`Eliminar ${this.selectedCountLabel()}?`)) {
      return;
    }

    this.images.update((images) => images.filter((image) => !selectedImageIds.has(image.id)));
    this.featuredImageIds.update((featuredImageIds) =>
      deleteImageIds(featuredImageIds, selectedImageIds),
    );
    this.selectedImageIds.set(new Set<string>());
  }

  protected removeImage(imageId: string): void {
    if (!window.confirm('Eliminar imagen?')) {
      return;
    }

    this.images.update((images) => images.filter((image) => image.id !== imageId));
    this.selectedImageIds.update((selectedImageIds) => deleteImageIds(selectedImageIds, [imageId]));
    this.featuredImageIds.update((featuredImageIds) => deleteImageIds(featuredImageIds, [imageId]));
  }
}
