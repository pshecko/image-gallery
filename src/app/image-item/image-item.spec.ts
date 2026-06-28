import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { galleryImages } from '../data/gallery-images';
import { ImageItem, MoveDirection } from './image-item';

@Component({
  imports: [ImageItem],
  template: `
    <app-image-item
      [image]="image"
      [loadsEagerly]="loadsEagerly"
      [isSelected]="isSelected"
      [isFeatured]="isFeatured"
      [canMovePrevious]="canMovePrevious"
      [canMoveNext]="canMoveNext"
      (selectImage)="selectedImageId = $event"
      (deleteImage)="deletedImageId = $event"
      (moveImage)="movedImage = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  loadsEagerly = false;
  isSelected = false;
  isFeatured = false;
  canMovePrevious = true;
  canMoveNext = true;
  selectedImageId = '';
  deletedImageId = '';
  movedImage: { imageId: string; direction: MoveDirection } | undefined;
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

  it('should render the image flush with the card top and full card width', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const image = compiled.querySelector('img');
    const body = compiled.querySelector('.image-card-body');

    expect(card?.classList.contains('p-3')).toBe(false);
    expect(card?.classList.contains('overflow-hidden')).toBe(true);
    expect(image?.classList.contains('w-full')).toBe(true);
    expect(image?.classList.contains('mb-3')).toBe(false);
    expect(image?.classList.contains('rounded-t')).toBe(true);
    expect(body?.classList.contains('p-3')).toBe(true);
  });

  it('should place the title and card actions on the same row', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.image-card-header');
    const title = compiled.querySelector('h2');
    const actions = compiled.querySelector('.image-card-actions');
    const movePreviousButton = compiled.querySelector('button[aria-label="Mover Imagen 1 antes"]');
    const moveNextButton = compiled.querySelector('button[aria-label="Mover Imagen 1 despues"]');
    const deleteButton = compiled.querySelector('button[aria-label="Eliminar Imagen 1"]');

    expect(header?.classList.contains('flex')).toBe(true);
    expect(header?.classList.contains('items-center')).toBe(true);
    expect(header?.classList.contains('justify-between')).toBe(true);
    expect(title?.parentElement).toBe(header);
    expect(title?.classList.contains('text-base')).toBe(true);
    expect(actions?.parentElement).toBe(header);
    expect(actions?.classList.contains('ml-auto')).toBe(true);
    expect(actions?.classList.contains('shrink-0')).toBe(true);
    expect(actions?.contains(movePreviousButton)).toBe(true);
    expect(actions?.contains(moveNextButton)).toBe(true);
    expect(actions?.contains(deleteButton)).toBe(true);
  });

  it('should load eagerly without changing the featured state', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.loadsEagerly = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const image = compiled.querySelector('img');

    expect(image?.getAttribute('loading')).not.toBe('lazy');
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
    const checkbox = compiled.querySelector('input[type="checkbox"]') as HTMLInputElement;

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
    const image = compiled.querySelector('img');

    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
    expect(image?.hasAttribute('role')).toBe(false);
    expect(image?.hasAttribute('tabindex')).toBe(false);
  });

  it('should make the image clickable through the native checkbox label', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const checkbox = compiled.querySelector(
      'input[type="checkbox"][aria-label="Seleccionar Imagen 1"]',
    ) as HTMLInputElement;
    const image = compiled.querySelector('img');
    const label = compiled.querySelector(`label[for="${checkbox.id}"]`);

    expect(checkbox.id).toBe('select-image-1');
    expect(label).not.toBeNull();
    expect(label?.contains(image)).toBe(true);
  });

  it('should show when an image is featured by its position', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.isFeatured = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const card = compiled.querySelector('.image-card');
    const title = compiled.querySelector('h2');

    expect(card?.classList.contains('featured')).toBe(true);
    expect(compiled.querySelector('button[aria-label="Feature Imagen 1"]')).toBeNull();
    expect(title?.classList.contains('text-slate-100')).toBe(true);
    expect(title?.classList.contains('text-gray-900')).toBe(false);
  });

  it('should render icon-only move and delete buttons with accessible labels', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const movePreviousButton = compiled.querySelector(
      'button[aria-label="Mover Imagen 1 antes"]',
    ) as HTMLButtonElement;
    const moveNextButton = compiled.querySelector(
      'button[aria-label="Mover Imagen 1 despues"]',
    ) as HTMLButtonElement;
    const deleteButton = compiled.querySelector(
      'button[aria-label="Eliminar Imagen 1"]',
    ) as HTMLButtonElement;

    expect(movePreviousButton.textContent?.trim()).toBe('');
    expect(moveNextButton.textContent?.trim()).toBe('');
    expect(deleteButton.textContent?.trim()).toBe('');
    expect(
      movePreviousButton.querySelector('svg[data-testid="move-previous-icon"]'),
    ).not.toBeNull();
    expect(moveNextButton.querySelector('svg[data-testid="move-next-icon"]')).not.toBeNull();
    expect(deleteButton.querySelector('svg[data-testid="delete-icon"]')).not.toBeNull();
    expect(movePreviousButton.classList.contains('gallery-action-button')).toBe(true);
    expect(moveNextButton.classList.contains('gallery-action-button')).toBe(true);
    expect(deleteButton.classList.contains('gallery-action-button')).toBe(true);
  });

  it('should disable unavailable movement directions', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.componentInstance.canMovePrevious = false;
    fixture.componentInstance.canMoveNext = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const movePreviousButton = compiled.querySelector(
      'button[aria-label="Mover Imagen 1 antes"]',
    ) as HTMLButtonElement;
    const moveNextButton = compiled.querySelector(
      'button[aria-label="Mover Imagen 1 despues"]',
    ) as HTMLButtonElement;

    expect(movePreviousButton.disabled).toBe(true);
    expect(moveNextButton.disabled).toBe(true);
  });

  it('should emit the image id when the checkbox is changed', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.query(By.css('input[type="checkbox"]'));
    const changeEvent = {
      stopPropagation: vi.fn(),
    } as unknown as Event;

    checkbox.triggerEventHandler('change', changeEvent);

    expect(changeEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.selectedImageId).toBe(galleryImages[0].id);
  });

  it('should emit the image id and direction when a move button is clicked', () => {
    const fixture = TestBed.createComponent(ImageItemHost);
    fixture.detectChanges();

    const moveNextButton = fixture.debugElement.query(
      By.css('button[aria-label="Mover Imagen 1 despues"]'),
    );
    const clickEvent = {
      stopPropagation: vi.fn(),
    } as unknown as MouseEvent;

    moveNextButton.triggerEventHandler('click', clickEvent);

    expect(clickEvent.stopPropagation).toHaveBeenCalled();
    expect(fixture.componentInstance.movedImage).toEqual({
      imageId: galleryImages[0].id,
      direction: 'next',
    });
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
