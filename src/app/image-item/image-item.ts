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
  readonly isSelected = input(false);
  readonly isPinned = input(false);
  readonly selectImage = output<string>();
  readonly deleteImage = output<string>();
  readonly pinImage = output<string>();

  protected onSelectClick(event: MouseEvent): void {
    event.stopPropagation();
    this.selectImage.emit(this.image().id);
  }

  protected onSelectKeydown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.selectImage.emit(this.image().id);
  }

  protected onCheckboxChange(event: Event): void {
    event.stopPropagation();
    this.selectImage.emit(this.image().id);
  }

  protected onPinClick(event: MouseEvent): void {
    event.stopPropagation();
    this.pinImage.emit(this.image().id);
  }

  protected onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteImage.emit(this.image().id);
  }
}
