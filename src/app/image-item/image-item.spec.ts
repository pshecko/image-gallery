import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { galleryImages } from '../data/gallery-images';
import { ImageItem } from './image-item';

@Component({
  imports: [ImageItem],
  template: `
    <app-image-item
      [image]="image"
      [loadsEagerly]="loadsEagerly"
      [isSelected]="isSelected"
      [isFeatured]="isFeatured"
      [isFeatureSelected]="isFeatureSelected"
      (selectImage)="selectedImageId = $event"
      (deleteImage)="deletedImageId = $event"
      (featureImage)="featuredImageId = $event"
    />
  `,
})
class ImageItemHost {
  image = galleryImages[0];
  loadsEagerly = false;
  isSelected = false;
  isFeatured = false;
  isFeatureSelected = false;
  selectedImageId = '';
  deletedImageId = '';
  featuredImageId = '';
}

type HostOverrides = Partial<
  Pick<ImageItemHost, 'isFeatured' | 'isFeatureSelected' | 'isSelected' | 'loadsEagerly'>
>;

type ImageItemHarness = {
  compiled: HTMLElement;
  fixture: ComponentFixture<ImageItemHost>;
  host: ImageItemHost;
};

type OutputName = 'deletedImageId' | 'featuredImageId' | 'selectedImageId';

function queryRequired<T extends Element>(compiled: HTMLElement, selector: string): T {
  const element = compiled.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Expected element matching selector: ${selector}`);
  }

  return element;
}

function setupImageItem(overrides: HostOverrides = {}): ImageItemHarness {
  const fixture = TestBed.createComponent(ImageItemHost);
  Object.assign(fixture.componentInstance, overrides);
  fixture.detectChanges();

  return {
    compiled: fixture.nativeElement as HTMLElement,
    fixture,
    host: fixture.componentInstance,
  };
}

function outputValue(host: ImageItemHost, outputName: OutputName): string {
  switch (outputName) {
    case 'deletedImageId':
      return host.deletedImageId;
    case 'featuredImageId':
      return host.featuredImageId;
    case 'selectedImageId':
      return host.selectedImageId;
  }
}

describe('ImageItem', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageItemHost],
    }).compileComponents();
  });

  it('should render image content and accessible controls', () => {
    const { compiled } = setupImageItem();
    const checkbox = queryRequired<HTMLInputElement>(
      compiled,
      'input[type="checkbox"][aria-label="Seleccionar Imagen 1"]',
    );
    const image = queryRequired<HTMLImageElement>(compiled, 'img');
    const label = queryRequired<HTMLLabelElement>(compiled, `label[for="${checkbox.id}"]`);
    const featureButton = queryRequired<HTMLButtonElement>(
      compiled,
      'button[aria-label="Feature Imagen 1"]',
    );
    const deleteButton = queryRequired<HTMLButtonElement>(
      compiled,
      'button[aria-label="Eliminar Imagen 1"]',
    );

    expect(image.getAttribute('src')).toContain(galleryImages[0].src);
    expect(image.getAttribute('alt')).toBe('Imagen de galeria 1');
    expect(compiled.textContent).toContain('Imagen 1');
    expect(checkbox.id).toBe('select-image-1');
    expect(checkbox.checked).toBe(false);
    expect(label.contains(image)).toBe(true);
    expect(image.hasAttribute('role')).toBe(false);
    expect(image.hasAttribute('tabindex')).toBe(false);
    expect(featureButton.textContent?.trim()).toBe('');
    expect(deleteButton.textContent?.trim()).toBe('');
    expect(featureButton.querySelector('svg[data-testid="feature-icon"]')).not.toBeNull();
    expect(deleteButton.querySelector('svg[data-testid="delete-icon"]')).not.toBeNull();
    expect(featureButton.querySelector('use')?.getAttribute('href')).toBe('icons/star.svg#star');
    expect(deleteButton.querySelector('use')?.getAttribute('href')).toBe('icons/trash.svg#trash');
    expect(compiled.querySelector('button[aria-label*="Mover"]')).toBeNull();
  });

  it('should keep the image flush with the card body below its media', () => {
    const { compiled } = setupImageItem();
    const card = queryRequired<HTMLElement>(compiled, '.image-card');
    const image = queryRequired<HTMLImageElement>(compiled, 'img');
    const body = queryRequired<HTMLElement>(compiled, '.image-card-body');
    const header = queryRequired<HTMLElement>(compiled, '.image-card-header');
    const title = queryRequired<HTMLHeadingElement>(compiled, 'h2');
    const actions = queryRequired<HTMLElement>(compiled, '.image-card-actions');

    expect(card.classList.contains('overflow-hidden')).toBe(true);
    expect(card.classList.contains('p-3')).toBe(false);
    expect(image.classList.contains('w-full')).toBe(true);
    expect(image.classList.contains('rounded-t')).toBe(true);
    expect(image.classList.contains('mb-3')).toBe(false);
    expect(body.classList.contains('p-3')).toBe(true);
    expect(header.classList.contains('flex')).toBe(true);
    expect(title.parentElement).toBe(header);
    expect(actions.parentElement).toBe(header);
    expect(actions.classList.contains('shrink-0')).toBe(true);
  });

  it('should apply loading, selected, and featured presentation states', () => {
    const { compiled } = setupImageItem({
      isFeatured: true,
      isFeatureSelected: true,
      isSelected: true,
      loadsEagerly: true,
    });
    const card = queryRequired<HTMLElement>(compiled, '.image-card');
    const checkbox = queryRequired<HTMLInputElement>(compiled, 'input[type="checkbox"]');
    const image = queryRequired<HTMLImageElement>(compiled, 'img');
    const title = queryRequired<HTMLHeadingElement>(compiled, 'h2');
    const featureButton = queryRequired<HTMLButtonElement>(
      compiled,
      'button[aria-label="Unfeature Imagen 1"]',
    );

    expect(card.classList.contains('selected')).toBe(true);
    expect(card.classList.contains('featured')).toBe(true);
    expect(checkbox.checked).toBe(true);
    expect(image.getAttribute('loading')).not.toBe('lazy');
    expect(image.getAttribute('fetchpriority')).toBe('high');
    expect(title.classList.contains('text-slate-100')).toBe(true);
    expect(title.classList.contains('text-gray-900')).toBe(false);
    expect(featureButton.getAttribute('aria-pressed')).toBe('true');
    expect(featureButton.querySelector('use')?.getAttribute('href')).toBe(
      'icons/star.svg#star-fill',
    );
  });

  it('should lazy load regular images', () => {
    const { compiled } = setupImageItem();
    const image = queryRequired<HTMLImageElement>(compiled, 'img');
    const card = queryRequired<HTMLElement>(compiled, '.image-card');

    expect(image.getAttribute('loading')).toBe('lazy');
    expect(image.getAttribute('fetchpriority')).toBe('auto');
    expect(card.classList.contains('featured')).toBe(false);
    expect(card.classList.contains('selected')).toBe(false);
  });

  it('should stop propagation and emit the image id from every action control', () => {
    const { fixture, host } = setupImageItem();
    const controlCases: {
      eventName: 'change' | 'click';
      outputName: OutputName;
      selector: string;
    }[] = [
      {
        eventName: 'change',
        outputName: 'selectedImageId',
        selector: 'input[type="checkbox"]',
      },
      {
        eventName: 'click',
        outputName: 'featuredImageId',
        selector: 'button[aria-label="Feature Imagen 1"]',
      },
      {
        eventName: 'click',
        outputName: 'deletedImageId',
        selector: 'button[aria-label="Eliminar Imagen 1"]',
      },
    ];

    for (const controlCase of controlCases) {
      const event = {
        stopPropagation: vi.fn(),
      } as unknown as Event;
      const control = fixture.debugElement.query(By.css(controlCase.selector));

      control.triggerEventHandler(controlCase.eventName, event);

      expect(event.stopPropagation).toHaveBeenCalled();
      expect(outputValue(host, controlCase.outputName)).toBe(galleryImages[0].id);
    }
  });
});
