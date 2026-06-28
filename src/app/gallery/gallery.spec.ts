import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';

import { galleryImages } from '../data/gallery-images';
import { GalleryImage } from '../models/gallery-image.model';
import { Gallery } from './gallery';

type GalleryTestApi = {
  deleteSelectedImages(): void;
  drop(event: CdkDragDrop<GalleryImage[]>): void;
};

type GalleryHarness = {
  compiled: HTMLElement;
  component: GalleryTestApi;
  detectChanges: () => Promise<void>;
};

function queryRequired<T extends Element>(compiled: HTMLElement, selector: string): T {
  const element = compiled.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected element matching selector: ${selector}`);
  }

  return element;
}

async function setupGallery(): Promise<GalleryHarness> {
  const fixture = TestBed.createComponent(Gallery);
  fixture.detectChanges();
  await fixture.whenStable();

  return {
    compiled: fixture.nativeElement as HTMLElement,
    component: fixture.componentInstance as unknown as GalleryTestApi,
    detectChanges: async () => {
      fixture.detectChanges();
      await fixture.whenStable();
    },
  };
}

function imageTitle(imageNumber: number): string {
  const image = galleryImages[imageNumber - 1];

  if (!image) {
    throw new Error(`Missing gallery image ${imageNumber}`);
  }

  return image.title;
}

function selectedCountLabel(count: number): string {
  return count === 1 ? '1 imagen seleccionada' : `${count} imagenes seleccionadas`;
}

function buttonByLabel(compiled: HTMLElement, label: string): HTMLButtonElement {
  return queryRequired<HTMLButtonElement>(compiled, `button[aria-label="${label}"]`);
}

function clickImageAction(
  compiled: HTMLElement,
  action: 'Eliminar' | 'Feature' | 'Unfeature',
  imageNumber: number,
): void {
  buttonByLabel(compiled, `${action} ${imageTitle(imageNumber)}`).click();
}

function changeCheckbox(compiled: HTMLElement, imageNumber: number): void {
  const checkbox = queryRequired<HTMLInputElement>(
    compiled,
    `input[type="checkbox"][aria-label="Seleccionar ${imageTitle(imageNumber)}"]`,
  );

  checkbox.checked = !checkbox.checked;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
}

function clickBatchAction(
  compiled: HTMLElement,
  action: 'Eliminar' | 'Feature',
  count: number,
): void {
  buttonByLabel(compiled, `${action} ${selectedCountLabel(count)}`).click();
}

function dropEvent(previousIndex: number, currentIndex: number): CdkDragDrop<GalleryImage[]> {
  return { previousIndex, currentIndex } as CdkDragDrop<GalleryImage[]>;
}

function itemTitles(compiled: HTMLElement): string[] {
  return Array.from(compiled.querySelectorAll('app-image-item h2')).map(
    (title) => title.textContent?.trim() ?? '',
  );
}

function featuredCards(compiled: HTMLElement): Element[] {
  return Array.from(compiled.querySelectorAll('.image-card.featured'));
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

  it('should render the gallery with neutral placeholder items', async () => {
    const { compiled } = await setupGallery();

    expect(compiled.querySelector('h1')?.textContent).toContain('Galeria de imagenes');
    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length);
    expect(featuredCards(compiled)).toHaveLength(0);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')).toBeNull();
  });

  it('should keep the responsive grid and eager-loading contract from the brief', async () => {
    const { compiled } = await setupGallery();
    const section = queryRequired<HTMLElement>(compiled, 'section');
    const grid = queryRequired<HTMLElement>(compiled, '[data-testid="gallery-grid"]');
    const images = Array.from(compiled.querySelectorAll<HTMLImageElement>('img'));

    expect(section.classList.contains('max-w-7xl')).toBe(true);
    expect(grid.classList.contains('grid')).toBe(true);
    expect(grid.classList.contains('grid-cols-2')).toBe(true);
    expect(grid.classList.contains('md:grid-cols-4')).toBe(true);
    expect(grid.classList.contains('lg:grid-cols-5')).toBe(true);
    expect(grid.classList.contains('gap-5')).toBe(true);
    expect(
      images.slice(0, 6).every((image) => image.getAttribute('fetchpriority') === 'high'),
    ).toBe(true);
    expect(images[6]?.getAttribute('loading')).toBe('lazy');
    expect(images[6]?.getAttribute('fetchpriority')).toBe('auto');
  });

  it('should expose CDK drag and drop only for regular image items', async () => {
    const { compiled } = await setupGallery();
    const grid = queryRequired<HTMLElement>(compiled, '[data-testid="gallery-grid"]');

    expect(grid.classList.contains('cdk-drop-list')).toBe(true);
    expect(grid.getAttribute('cdkDropListOrientation')).toBe('mixed');
    expect(compiled.querySelectorAll('app-image-item.cdk-drag')).toHaveLength(galleryImages.length);
    expect(compiled.querySelector('button[aria-label*="Mover"]')).toBeNull();
  });

  it('should reorder regular images without creating a default featured item', async () => {
    const { compiled, component, detectChanges } = await setupGallery();

    component.drop(dropEvent(0, 2));
    await detectChanges();

    expect(itemTitles(compiled).slice(0, 3)).toEqual(['Imagen 2', 'Imagen 3', 'Imagen 1']);
    expect(featuredCards(compiled)).toHaveLength(0);
  });

  it('should leave image order unchanged when a drop does not move positions', async () => {
    const { compiled, component, detectChanges } = await setupGallery();
    const originalTitles = itemTitles(compiled);

    component.drop(dropEvent(1, 1));
    await detectChanges();

    expect(itemTitles(compiled)).toEqual(originalTitles);
    expect(featuredCards(compiled)).toHaveLength(0);
  });

  it('should feature and unfeature images from the star button', async () => {
    const { compiled, detectChanges } = await setupGallery();

    clickImageAction(compiled, 'Feature', 3);
    await detectChanges();

    const firstItem = queryRequired<HTMLElement>(compiled, 'app-image-item');

    expect(itemTitles(compiled).slice(0, 3)).toEqual(['Imagen 3', 'Imagen 1', 'Imagen 2']);
    expect(featuredCards(compiled)).toHaveLength(1);
    expect(firstItem.classList.contains('lg:col-span-2')).toBe(true);
    expect(firstItem.classList.contains('lg:row-span-2')).toBe(true);
    expect(buttonByLabel(compiled, 'Unfeature Imagen 3')).not.toBeNull();

    clickImageAction(compiled, 'Unfeature', 3);
    await detectChanges();

    expect(itemTitles(compiled).slice(0, 3)).toEqual(['Imagen 1', 'Imagen 2', 'Imagen 3']);
    expect(featuredCards(compiled)).toHaveLength(0);
    expect(buttonByLabel(compiled, 'Feature Imagen 3')).not.toBeNull();
  });

  it('should keep featured images fixed while reordering regular items', async () => {
    const { compiled, component, detectChanges } = await setupGallery();

    clickImageAction(compiled, 'Feature', 1);
    await detectChanges();

    expect(compiled.querySelector('app-image-item')?.classList.contains('cdk-drag')).toBe(false);
    expect(compiled.querySelectorAll('app-image-item.cdk-drag')).toHaveLength(
      galleryImages.length - 1,
    );

    component.drop(dropEvent(0, 2));
    await detectChanges();

    expect(itemTitles(compiled).slice(0, 4)).toEqual([
      'Imagen 1',
      'Imagen 3',
      'Imagen 4',
      'Imagen 2',
    ]);
    expect(featuredCards(compiled)).toHaveLength(1);
  });

  it('should show singular and plural selection toolbar states', async () => {
    const { compiled, detectChanges } = await setupGallery();

    changeCheckbox(compiled, 1);
    await detectChanges();

    expect(compiled.querySelectorAll('.image-card.selected')).toHaveLength(1);
    expect(queryRequired<HTMLInputElement>(compiled, '#select-image-1').checked).toBe(true);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent).toContain(
      selectedCountLabel(1),
    );
    expect(buttonByLabel(compiled, 'Feature 1 imagen seleccionada')).not.toBeNull();
    expect(buttonByLabel(compiled, 'Eliminar 1 imagen seleccionada')).not.toBeNull();

    changeCheckbox(compiled, 2);
    await detectChanges();

    expect(compiled.querySelectorAll('.image-card.selected')).toHaveLength(2);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')?.textContent).toContain(
      selectedCountLabel(2),
    );
    expect(buttonByLabel(compiled, 'Feature 2 imagenes seleccionadas')).not.toBeNull();
    expect(buttonByLabel(compiled, 'Eliminar 2 imagenes seleccionadas')).not.toBeNull();
  });

  it('should feature selected images from the selection toolbar without clearing selection', async () => {
    const { compiled, detectChanges } = await setupGallery();

    changeCheckbox(compiled, 3);
    changeCheckbox(compiled, 5);
    await detectChanges();

    clickBatchAction(compiled, 'Feature', 2);
    await detectChanges();

    expect(itemTitles(compiled).slice(0, 5)).toEqual([
      'Imagen 3',
      'Imagen 5',
      'Imagen 1',
      'Imagen 2',
      'Imagen 4',
    ]);
    expect(featuredCards(compiled)).toHaveLength(2);
    expect(compiled.querySelectorAll('.image-card.selected')).toHaveLength(2);
    expect(buttonByLabel(compiled, 'Unfeature Imagen 3')).not.toBeNull();
    expect(buttonByLabel(compiled, 'Unfeature Imagen 5')).not.toBeNull();
  });

  it('should not ask for confirmation when deleting with an empty selection', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const { compiled, component, detectChanges } = await setupGallery();

    component.deleteSelectedImages();
    await detectChanges();

    expect(confirm).not.toHaveBeenCalled();
    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length);
  });

  it('should delete selected images after confirmation and clear selection state', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { compiled, detectChanges } = await setupGallery();

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    await detectChanges();

    clickBatchAction(compiled, 'Eliminar', 2);
    await detectChanges();

    expect(confirm).toHaveBeenCalledWith('Eliminar 2 imagenes seleccionadas?');
    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length - 2);
    expect(itemTitles(compiled)).not.toContain('Imagen 1');
    expect(itemTitles(compiled)).not.toContain('Imagen 2');
    expect(featuredCards(compiled)).toHaveLength(0);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')).toBeNull();
  });

  it('should keep selected images when batch deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { compiled, detectChanges } = await setupGallery();

    changeCheckbox(compiled, 1);
    changeCheckbox(compiled, 2);
    await detectChanges();

    clickBatchAction(compiled, 'Eliminar', 2);
    await detectChanges();

    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length);
    expect(compiled.querySelectorAll('.image-card.selected')).toHaveLength(2);
    expect(itemTitles(compiled)).toEqual(galleryImages.map((image) => image.title));
  });

  it('should delete one image and remove it from selected and featured state', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { compiled, detectChanges } = await setupGallery();

    clickImageAction(compiled, 'Feature', 1);
    changeCheckbox(compiled, 1);
    await detectChanges();

    clickImageAction(compiled, 'Eliminar', 1);
    await detectChanges();

    expect(confirm).toHaveBeenCalledWith('Eliminar imagen?');
    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length - 1);
    expect(itemTitles(compiled)[0]).toBe('Imagen 2');
    expect(itemTitles(compiled)).not.toContain('Imagen 1');
    expect(featuredCards(compiled)).toHaveLength(0);
    expect(compiled.querySelector('[data-testid="selection-toolbar"]')).toBeNull();
    expect(compiled.querySelector('button[aria-label="Unfeature Imagen 1"]')).toBeNull();
  });

  it('should keep one image when deletion is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { compiled, detectChanges } = await setupGallery();

    clickImageAction(compiled, 'Eliminar', 1);
    await detectChanges();

    expect(compiled.querySelectorAll('app-image-item')).toHaveLength(galleryImages.length);
    expect(itemTitles(compiled)).toContain('Imagen 1');
  });
});
