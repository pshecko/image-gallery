import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from './image-item';

@Component({
  imports: [ImageItem],
  template: `
    <app-image-item [image]="image" />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
}

describe('ImageItem', () => {
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
});
