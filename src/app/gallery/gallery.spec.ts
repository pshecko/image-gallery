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
});
