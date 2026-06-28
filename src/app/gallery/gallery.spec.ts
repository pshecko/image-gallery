import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';

import { galleryImages } from '../data/gallery-images';
import { GalleryImage } from '../models/gallery-image.model';
import { Gallery } from './gallery';

function getItemTitles(compiled: HTMLElement): string[] {
  return Array.from(compiled.querySelectorAll('app-image-item h2')).map(
    (title) => title.textContent?.trim() ?? '',
  );
}

function changeCheckbox(compiled: HTMLElement, imageNumber: number): void {
  const checkbox = compiled.querySelector(
    `input[type="checkbox"][aria-label="Seleccionar Imagen ${imageNumber}"]`,
  ) as HTMLInputElement;

  checkbox.checked = !checkbox.checked;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
}

function clickMoveButton(
  compiled: HTMLElement,
  imageNumber: number,
  direction: 'antes' | 'despues',
): void {
  const button = compiled.querySelector(
    `button[aria-label="Mover Imagen ${imageNumber} ${direction}"]`,
  ) as HTMLButtonElement;

  button.click();
}

describe('Gallery', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery],
    }).compileComponents();
  });

  it('should render one image item for each placeholder image and feature the first position', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.image-card');

    expect(compiled.querySelector('h1')?.textContent).toContain('Galeria de imagenes');
    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length);
    expect(cards[0]?.classList.contains('featured')).toBe(true);
    expect(compiled.querySelectorAll('.image-card.featured').length).toBe(1);
  });

  it('should use the responsive grid requested by the brief', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const section = compiled.querySelector('section');
    const grid = compiled.querySelector('[data-testid="gallery-grid"]');
    const firstItem = compiled.querySelector('app-image-item');

    expect(section?.classList.contains('max-w-7xl')).toBe(true);
    expect(grid?.classList.contains('grid')).toBe(true);
    expect(grid?.classList.contains('grid-cols-2')).toBe(true);
    expect(grid?.classList.contains('md:grid-cols-4')).toBe(true);
    expect(grid?.classList.contains('lg:grid-cols-5')).toBe(true);
    expect(grid?.classList.contains('gap-5')).toBe(true);
    expect(firstItem?.classList.contains('lg:col-span-2')).toBe(true);
    expect(firstItem?.classList.contains('lg:row-span-2')).toBe(true);
  });

  it('should load the first visible grid items eagerly', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const images = Array.from(compiled.querySelectorAll('img'));
    const firstVisibleImages = images.slice(0, 6);
    const laterImage = images[6];

    expect(firstVisibleImages).toHaveLength(6);
    firstVisibleImages.forEach((image) => {
      expect(image.getAttribute('loading')).not.toBe('lazy');
      expect(image.getAttribute('fetchpriority')).toBe('high');
    });
    expect(laterImage?.getAttribute('loading')).toBe('lazy');
    expect(laterImage?.getAttribute('fetchpriority')).toBe('auto');
  });

  it('should render the grid as a CDK drop list with draggable image items', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('[data-testid="gallery-grid"]');

    expect(grid?.classList.contains('cdk-drop-list')).toBe(true);
    expect(grid?.getAttribute('cdkDropListOrientation')).toBe('mixed');
    expect(compiled.querySelectorAll('app-image-item.cdk-drag').length).toBe(galleryImages.length);
  });

  it('should reorder images and feature the new first position when an item is dropped', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance as unknown as {
      drop(event: CdkDragDrop<GalleryImage[]>): void;
    };
    const dropEvent = {
      previousIndex: 0,
      currentIndex: 2,
    } as CdkDragDrop<GalleryImage[]>;

    component.drop(dropEvent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.image-card');

    expect(getItemTitles(compiled).slice(0, 3)).toEqual(['Imagen 2', 'Imagen 3', 'Imagen 1']);
    expect(cards[0]?.classList.contains('featured')).toBe(true);
    expect(cards[2]?.classList.contains('featured')).toBe(false);
  });

  it('should reorder images with keyboard-accessible move buttons', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickMoveButton(compiled, 1, 'despues');
    fixture.detectChanges();

    let cards = compiled.querySelectorAll('.image-card');

    expect(getItemTitles(compiled).slice(0, 3)).toEqual(['Imagen 2', 'Imagen 1', 'Imagen 3']);
    expect(cards[0]?.classList.contains('featured')).toBe(true);

    clickMoveButton(compiled, 1, 'antes');
    fixture.detectChanges();

    cards = compiled.querySelectorAll('.image-card');

    expect(getItemTitles(compiled).slice(0, 3)).toEqual(['Imagen 1', 'Imagen 2', 'Imagen 3']);
    expect(cards[0]?.classList.contains('featured')).toBe(true);
  });

  it('should disable move buttons at the list boundaries', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const firstPrevious = compiled.querySelector(
      'button[aria-label="Mover Imagen 1 antes"]',
    ) as HTMLButtonElement;
    const lastNext = compiled.querySelector(
      'button[aria-label="Mover Imagen 12 despues"]',
    ) as HTMLButtonElement;

    expect(firstPrevious.disabled).toBe(true);
    expect(lastNext.disabled).toBe(true);
  });

  it('should allow selecting multiple images with checkboxes', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

    expect(checkboxes[0]?.checked).toBe(true);
    expect(checkboxes[1]?.checked).toBe(true);
    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(2);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent).toContain(
      '2 imagenes seleccionadas',
    );
    expect(
      compiled.querySelector('button[aria-label="Eliminar 2 imagenes seleccionadas"]'),
    ).not.toBeNull();
  });

  it('should delete selected images when batch deletion is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    fixture.detectChanges();

    const deleteSelectedButton = compiled.querySelector(
      'button[aria-label="Eliminar 2 imagenes seleccionadas"]',
    ) as HTMLButtonElement;

    deleteSelectedButton.click();
    fixture.detectChanges();

    const cards = compiled.querySelectorAll('.image-card');

    expect(window.confirm).toHaveBeenCalledWith('Eliminar 2 imagenes seleccionadas?');
    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length - 2);
    expect(getItemTitles(compiled)).not.toContain('Imagen 1');
    expect(getItemTitles(compiled)).not.toContain('Imagen 2');
    expect(cards[0]?.classList.contains('featured')).toBe(true);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')).toBeNull();
  });

  it('should keep selected images when batch deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    fixture.detectChanges();

    const deleteSelectedButton = compiled.querySelector(
      'button[aria-label="Eliminar 2 imagenes seleccionadas"]',
    ) as HTMLButtonElement;

    deleteSelectedButton.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length);
    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(2);
    expect(compiled.textContent).toContain('Imagen 1');
    expect(compiled.textContent).toContain('Imagen 2');
  });

  it('should remove an image and feature the next first position when deletion is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector(
      'button[aria-label="Eliminar Imagen 1"]',
    ) as HTMLButtonElement;

    deleteButton.click();
    fixture.detectChanges();

    const cards = compiled.querySelectorAll('.image-card');

    expect(window.confirm).toHaveBeenCalledWith('Eliminar imagen?');
    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length - 1);
    expect(getItemTitles(compiled)[0]).toBe('Imagen 2');
    expect(cards[0]?.classList.contains('featured')).toBe(true);
  });

  it('should keep an image when deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const deleteButton = compiled.querySelector(
      'button[aria-label="Eliminar Imagen 1"]',
    ) as HTMLButtonElement;

    deleteButton.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length);
    expect(compiled.textContent).toContain('Imagen 1');
  });
});
