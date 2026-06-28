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
      [isPinned]="isPinned"
      (selectImage)="selectedImageId = $event"
      (deleteImage)="deletedImageId = $event"
      (pinImage)="pinnedImageId = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  isFeatured = false;
  isSelected = false;
  isPinned = false;
  selectedImageId = '';
  deletedImageId = '';
  pinnedImageId = '';
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

  it('should not enlarge a pinned image card', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isPinned = true;
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');

    expect(card?.classList.contains('pinned')).toBe(true);
    expect(card?.classList.contains('featured')).toBe(false);
    expect(card?.classList.contains('md:col-span-2')).toBe(false);
    expect(card?.classList.contains('md:row-span-2')).toBe(false);
  });

  it('should keep the normal card size when an image has priority loading', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');

    expect(card?.classList.contains('featured')).toBe(false);
    expect(card?.classList.contains('md:col-span-2')).toBe(false);
    expect(card?.classList.contains('md:row-span-2')).toBe(false);
  });

  it('should show when an image is selected', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isSelected = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const checkbox = compiled.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;

    expect(card?.classList.contains('selected')).toBe(true);
    expect(checkbox?.checked).toBe(true);
    expect(compiled.textContent).not.toContain('Seleccionada');
  });

  it('should render a plain checkbox for selecting the image', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector(
      'input[type="checkbox"][aria-label="Seleccionar Imagen 1"]',
    ) as HTMLInputElement;

    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
    expect(compiled.querySelector('.selection-control')).toBeNull();
  });

  it('should show when an image is pinned', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isPinned = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const pinButton = compiled.querySelector(
      'button[aria-label="Unpin Imagen 1"]',
    ) as HTMLButtonElement;
    const title = compiled.querySelector('h2');

    expect(pinButton).not.toBeNull();
    expect(pinButton.getAttribute('aria-pressed')).toBe('true');
    expect(title?.classList.contains('text-slate-100')).toBe(true);
    expect(title?.classList.contains('text-gray-900')).toBe(false);
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

  it('should emit the image id when the checkbox is changed', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(
      By.css('input[type="checkbox"]'),
    );
    const changeEvent = {
      stopPropagation: vi.fn(),
    } as unknown as Event;

    checkbox.triggerEventHandler('change', changeEvent);

    expect(changeEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.selectedImageId).toBe(galleryImages[0].id);
  });

  it('should emit the image id when the pin button is clicked', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const pinButton = fixture.debugElement.query(
      By.css('button[aria-label="Pin Imagen 1"]'),
    );
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    pinButton.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.pinnedImageId).toBe(galleryImages[0].id);
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

    const deleteButton = fixture.debugElement.query(
      By.css('button[aria-label="Eliminar Imagen 1"]'),
    );
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    deleteButton.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.deletedImageId).toBe(galleryImages[0].id);
  });
});
