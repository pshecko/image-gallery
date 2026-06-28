import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { GalleryImage } from '../models/gallery-image.model';

export type MoveDirection = 'previous' | 'next';

@Component({
  selector: 'app-image-item',
  imports: [ButtonModule, NgOptimizedImage],
  templateUrl: './image-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageItem {
  readonly image = input.required<GalleryImage>();
  readonly loadsEagerly = input(false);
  readonly isSelected = input(false);
  readonly isFeatured = input(false);
  readonly canMovePrevious = input(false);
  readonly canMoveNext = input(false);
  readonly selectImage = output<string>();
  readonly deleteImage = output<string>();
  readonly moveImage = output<{
    imageId: string;
    direction: MoveDirection;
  }>();

  protected onCheckboxChange(event: Event): void {
    event.stopPropagation();
    this.selectImage.emit(this.image().id);
  }

  protected onMoveClick(event: MouseEvent, direction: MoveDirection): void {
    event.stopPropagation();
    this.moveImage.emit({ imageId: this.image().id, direction });
  }

  protected onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteImage.emit(this.image().id);
  }
}
