import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from './image-item';

@Component({
  imports: [ImageItem],
  template: `
    <app-image-item
      [image]="image"
      [isFeatured]="isFeatured"
      (deleteImage)="deletedImageId = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  isFeatured = false;
  deletedImageId = '';
}

describe('ImageItem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageItemHost],
    }).compileComponents();
  });

  it('should render a placeholder image with its neutral label', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('img');

    expect(image?.getAttribute('src')).toContain(galleryImages[0].src);
    expect(image?.getAttribute('alt')).toBe('Imagen de galeria 1');
    expect(compiled.textContent).toContain('Imagen 1');
  });

  it('should apply a featured class when the image is featured', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');

    expect(card?.classList.contains('featured')).toBe(true);
  });

  it('should make a featured image span two rows and columns from tablet size', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');

    expect(card?.classList.contains('md:col-span-2')).toBe(true);
    expect(card?.classList.contains('md:row-span-2')).toBe(true);
  });

  it('should emit the image id when the delete button is clicked', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.query(By.css('button'));
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    deleteButton.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.deletedImageId).toBe(galleryImages[0].id);
  });
});
