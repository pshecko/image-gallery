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
      [loadsEagerly]="loadsEagerly"
      [isSelected]="isSelected"
      [isFeatured]="isFeatured"
      (selectImage)="selectedImageId = $event"
      (deleteImage)="deletedImageId = $event"
      (featureImage)="featuredImageId = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  loadsEagerly = false;
  isSelected = false;
  isFeatured = false;
  selectedImageId = '';
  deletedImageId = '';
  featuredImageId = '';
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

  it('should load eagerly without changing the featured state', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.loadsEagerly = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const image = compiled.querySelector('img');

    expect(image?.getAttribute('loading')).toBe('eager');
    expect(image?.getAttribute('fetchpriority')).toBe('high');
    expect(card?.classList.contains('featured')).toBe(false);
  });

  it('should lazy load regular images', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector('img');

    expect(image?.getAttribute('loading')).toBe('lazy');
    expect(image?.getAttribute('fetchpriority')).toBe('auto');
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

  it('should show when an image is featured', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const featureButton = compiled.querySelector(
      'button[aria-label="Unfeature Imagen 1"]',
    ) as HTMLButtonElement;
    const title = compiled.querySelector('h2');

    expect(card?.classList.contains('featured')).toBe(true);
    expect(featureButton).not.toBeNull();
    expect(featureButton.getAttribute('aria-pressed')).toBe('true');
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

  it('should emit the image id when the feature button is clicked', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const featureButton = fixture.debugElement.query(
      By.css('button[aria-label="Feature Imagen 1"]'),
    );
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    featureButton.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.featuredImageId).toBe(galleryImages[0].id);
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
