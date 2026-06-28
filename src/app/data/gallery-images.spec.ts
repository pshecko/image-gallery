import { galleryImages } from './gallery-images';

describe('galleryImages', () => {
  it('should provide an expanded placeholder gallery with neutral labels', () => {
    expect(galleryImages).toHaveLength(12);
    expect(new Set(galleryImages.map((image) => image.src)).size).toBe(
      galleryImages.length,
    );

    galleryImages.forEach((image, index) => {
      const imageNumber = index + 1;

      expect(image.id).toBe(String(imageNumber));
      expect(image.title).toBe(`Imagen ${imageNumber}`);
      expect(image.alt).toBe(`Imagen de galeria ${imageNumber}`);
      expect(image.src).toContain('https://picsum.photos/');
    });
  });
});
