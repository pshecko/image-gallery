import { TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { galleryImages } from '../data/gallery-images';
import { GalleryImage } from '../models/gallery-image.model';
import { Gallery } from './gallery';

function getItemTitles(compiled: HTMLElement): string[] {
  return Array.from(compiled.querySelectorAll('app-image-item h2')).map(
    (title) => title.textContent?.trim() ?? '',
  );
}

function clickImage(compiled: HTMLElement, imageNumber: number): void {
  const image = compiled.querySelector(
    `img[alt="Imagen de galeria ${imageNumber}"]`,
  ) as HTMLImageElement;

  image.click();
}

function changeCheckbox(compiled: HTMLElement, imageNumber: number): void {
  const checkbox = compiled.querySelector(
    `input[type="checkbox"][aria-label="Seleccionar Imagen ${imageNumber}"]`,
  ) as HTMLInputElement;

  checkbox.checked = !checkbox.checked;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
}

function clickPinButton(compiled: HTMLElement, imageNumber: number): void {
  const pinButton = compiled.querySelector(
    `button[aria-label="Pin Imagen ${imageNumber}"]`,
  ) as HTMLButtonElement;

  pinButton.click();
}

function clickUnpinButton(compiled: HTMLElement, imageNumber: number): void {
  const unpinButton = compiled.querySelector(
    `button[aria-label="Unpin Imagen ${imageNumber}"]`,
  ) as HTMLButtonElement;

  unpinButton.click();
}

function clickPinButton(compiled: HTMLElement, imageNumber: number): void {
  const pinButton = compiled.querySelector(
    `button[aria-label="Pin Imagen ${imageNumber}"]`,
  ) as HTMLButtonElement;

  pinButton.click();
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

  it('should render one image item for each placeholder image', async () => {
    const fixture = TestBed.createComponent(Gallery);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Galeria de imagenes');
    expect(compiled.querySelectorAll('app-image-item').length).toBe(galleryImages.length);
  });

  it('should mark an image as pinned after pinning it', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickPinButton(compiled, 1);
    fixture.detectChanges();

    const cards = compiled.querySelectorAll('.image-card');

    expect(cards[0]?.classList.contains('pinned')).toBe(true);
    expect(cards[1]?.classList.contains('pinned')).toBe(false);
  });

  it('should use the responsive grid required by the briefing', async () => {
    const fixture = TestBed.createComponent(Gallery);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('[data-testid="gallery-grid"]');

    expect(grid?.classList.contains('grid-cols-2')).toBe(true);
    expect(grid?.classList.contains('md:grid-cols-4')).toBe(true);
    expect(grid?.classList.contains('lg:grid-cols-5')).toBe(true);
  });

  it('should prioritize the first visible image for loading', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const image = compiled.querySelector(
      'img[alt="Imagen de galeria 1"]',
    ) as HTMLImageElement;

    expect(image.getAttribute('loading')).toBe('eager');
    expect(image.getAttribute('fetchpriority')).toBe('high');
  });

  it('should render the grid as a CDK drop list with draggable image items', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const grid = compiled.querySelector('[data-testid="gallery-grid"]');

    expect(grid?.classList.contains('cdk-drop-list')).toBe(true);
    expect(grid?.getAttribute('cdkDropListOrientation')).toBe('mixed');
    expect(compiled.querySelectorAll('app-image-item.cdk-drag').length).toBe(
      galleryImages.length,
    );
  });

  it('should reorder images when an item is dropped', async () => {
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
    expect(getItemTitles(compiled).slice(0, 3)).toEqual([
      'Imagen 2',
      'Imagen 3',
      'Imagen 1',
    ]);
  });

  it('should exclude pinned images from drag and drop reordering', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as unknown as {
      drop(event: CdkDragDrop<GalleryImage[]>): void;
    };

    clickPinButton(compiled, 1);
    fixture.detectChanges();

    const imageItems = Array.from(compiled.querySelectorAll('app-image-item'));

    expect(imageItems[0]?.classList.contains('cdk-drag')).toBe(false);
    expect(
      imageItems.filter((imageItem) =>
        imageItem.classList.contains('cdk-drag'),
      ).length,
    ).toBe(galleryImages.length - 1);

    component.drop({
      previousIndex: 0,
      currentIndex: 2,
    } as CdkDragDrop<GalleryImage[]>);
    fixture.detectChanges();

    expect(getItemTitles(compiled).slice(0, 4)).toEqual([
      'Imagen 1',
      'Imagen 3',
      'Imagen 4',
      'Imagen 2',
    ]);
    expect(cards[0]?.classList.contains('pinned')).toBe(false);
    expect(cards[2]?.classList.contains('pinned')).toBe(false);
  });

  it('should move a pinned image above the other images', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickPinButton(compiled, 3);
    fixture.detectChanges();

    const cards = compiled.querySelectorAll('.image-card');

    expect(getItemTitles(compiled).slice(0, 3)).toEqual([
      'Imagen 3',
      'Imagen 1',
      'Imagen 2',
    ]);
    expect(cards[0]?.classList.contains('pinned')).toBe(true);
    expect(cards[1]?.classList.contains('pinned')).toBe(false);
  });

  it('should keep multiple pinned images above unpinned images', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickPinButton(compiled, 3);
    fixture.detectChanges();

    clickPinButton(compiled, 5);
    fixture.detectChanges();

    expect(getItemTitles(compiled)).toEqual([
      'Imagen 3',
      'Imagen 5',
      'Imagen 1',
      'Imagen 2',
      'Imagen 4',
      'Imagen 6',
    ]);
    expect(
      compiled.querySelector('button[aria-label="Unpin Imagen 3"]'),
    ).not.toBeNull();
    expect(
      compiled.querySelector('button[aria-label="Unpin Imagen 5"]'),
    ).not.toBeNull();
    expect(compiled.querySelectorAll('.image-card.pinned').length).toBe(2);
  });

  it('should move an unpinned image back with the other unpinned images', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickPinButton(compiled, 3);
    fixture.detectChanges();

    clickUnpinButton(compiled, 3);
    fixture.detectChanges();

    expect(getItemTitles(compiled).slice(0, 3)).toEqual([
      'Imagen 1',
      'Imagen 2',
      'Imagen 3',
    ]);
    expect(
      compiled.querySelector('button[aria-label="Pin Imagen 3"]'),
    ).not.toBeNull();
    expect(compiled.querySelectorAll('.image-card.pinned').length).toBe(0);
  });

  it('should select and deselect an image', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickImage(compiled, 1);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(1);
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent,
    ).toContain('1 imagen seleccionada');

    clickImage(compiled, 1);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(0);
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]'),
    ).toBeNull();
  });

  it('should allow selecting multiple images', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickImage(compiled, 1);
    clickImage(compiled, 2);
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(2);
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent,
    ).toContain('2 imagenes seleccionadas');
    expect(
      compiled.querySelector(
        'button[aria-label="Eliminar 2 imagenes seleccionadas"]',
      ),
    ).not.toBeNull();
  });

  it('should allow selecting multiple images with checkboxes', async () => {
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    fixture.detectChanges();

    const checkboxes = compiled.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]',
    );

    expect(checkboxes[0]?.checked).toBe(true);
    expect(checkboxes[1]?.checked).toBe(true);
    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(2);
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent,
    ).toContain('2 imagenes seleccionadas');
  });

  it('should delete selected images when batch deletion is confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickImage(compiled, 1);
    clickImage(compiled, 2);
    fixture.detectChanges();

    const deleteSelectedButton = compiled.querySelector(
      'button[aria-label="Eliminar 2 imagenes seleccionadas"]',
    ) as HTMLButtonElement;

    deleteSelectedButton.click();
    fixture.detectChanges();

    expect(window.confirm).toHaveBeenCalledWith(
      'Eliminar 2 imagenes seleccionadas?',
    );
    expect(compiled.querySelectorAll('app-image-item').length).toBe(
      galleryImages.length - 2,
    );
    expect(compiled.textContent).not.toContain('Imagen 1');
    expect(compiled.textContent).not.toContain('Imagen 2');
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]'),
    ).toBeNull();
  });

  it('should keep selected images when batch deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickImage(compiled, 1);
    clickImage(compiled, 2);
    fixture.detectChanges();

    const deleteSelectedButton = compiled.querySelector(
      'button[aria-label="Eliminar 2 imagenes seleccionadas"]',
    ) as HTMLButtonElement;

    deleteSelectedButton.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-image-item').length).toBe(
      galleryImages.length,
    );
    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(2);
    expect(compiled.textContent).toContain('Imagen 1');
    expect(compiled.textContent).toContain('Imagen 2');
  });

  it('should clear selection for an image removed individually', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fixture = TestBed.createComponent(Gallery);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;

    clickImage(compiled, 1);
    fixture.detectChanges();

    const deleteButton = compiled.querySelector(
      'button[aria-label="Eliminar Imagen 1"]',
    ) as HTMLButtonElement;

    deleteButton.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('app-image-item').length).toBe(
      galleryImages.length - 1,
    );
    expect(compiled.querySelectorAll('.image-card.selected').length).toBe(0);
    expect(
      compiled.querySelector('[data-testid="selection-toolbar"]'),
    ).toBeNull();
  });

  it('should remove an image when deletion is confirmed', async () => {
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

    expect(window.confirm).toHaveBeenCalledWith('Eliminar imagen?');
    expect(compiled.querySelectorAll('app-image-item').length).toBe(
      galleryImages.length - 1,
    );
    expect(compiled.textContent).not.toContain('Imagen 1');
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

    expect(compiled.querySelectorAll('app-image-item').length).toBe(
      galleryImages.length,
    );
    expect(compiled.textContent).toContain('Imagen 1');
  });
});
