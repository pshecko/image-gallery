import { galleryImages } from './gallery-images';

describe('galleryImages', () => {
  it('should provide an expanded placeholder gallery with neutral labels', () => {
    expect(galleryImages).toHaveLength(12);
    expect(new Set(galleryImages.map((image) => image.src)).size).toBe(galleryImages.length);

    galleryImages.forEach((image, index) => {
      const imageNumber = index + 1;

      expect(image).toEqual(
        expect.objectContaining({
          alt: `Imagen de galeria ${imageNumber}`,
          id: String(imageNumber),
          title: `Imagen ${imageNumber}`,
        }),
      );
      expect(image.src).toContain('https://picsum.photos/');
    });
  });
});
