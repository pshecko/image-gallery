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
      [isSelected]="isSelected"
      (selectImage)="selectedImageId = $event"
      (deleteImage)="deletedImageId = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  isFeatured = false;
  isSelected = false;
  selectedImageId = '';
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

  it('should show when an image is selected', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isSelected = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');

    expect(card?.classList.contains('selected')).toBe(true);
    expect(compiled.textContent).toContain('Seleccionada');
  });

  it('should emit the image id when the image is clicked', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    image.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.selectedImageId).toBe(galleryImages[0].id);
  });

  it('should emit the image id when selection is triggered from the keyboard', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const image = fixture.debugElement.query(By.css('img'));
    const keydownEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;

    image.triggerEventHandler('keydown.enter', keydownEvent);

    expect(keydownEvent.preventDefault).toHaveBeenCalled();
    expect(keydownEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.selectedImageId).toBe(galleryImages[0].id);
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
