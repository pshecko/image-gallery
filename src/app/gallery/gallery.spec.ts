import { TestBed } from '@angular/core/testing';

import { galleryImages } from '../data/gallery-images';
import { Gallery } from './gallery';

describe('Gallery', () => {
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

  it('should mark the first image as featured', async () => {
    const fixture = TestBed.createComponent(Gallery);
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.image-card');

    expect(cards[0]?.classList.contains('featured')).toBe(true);
    expect(cards[1]?.classList.contains('featured')).toBe(false);
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
});
