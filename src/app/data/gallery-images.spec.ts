import { galleryImages } from './gallery-images';

describe('galleryImages', () => {
  it('should provide a small placeholder gallery with neutral labels', () => {
    expect(galleryImages.length).toBeGreaterThanOrEqual(6);
    expect(galleryImages.length).toBeLessThanOrEqual(8);

    galleryImages.forEach((image, index) => {
      const imageNumber = index + 1;

      expect(image.id).toBe(String(imageNumber));
      expect(image.title).toBe(`Imagen ${imageNumber}`);
      expect(image.alt).toBe(`Imagen de galeria ${imageNumber}`);
      expect(image.src).toContain('https://picsum.photos/');
    });
  });
});
