# Image Gallery

Galeria de imagenes creada con Angular para practicar componentes standalone,
signals, inputs, outputs, testing y organizacion con ramas de Git.

## Funcionalidades

- Grid responsive de imagenes de marcador de posicion desde Picsum.
- Primera imagen destacada visualmente.
- Eliminacion individual con confirmacion.
- Reordenamiento con Angular CDK drag and drop.
- Seleccion multiple de imagenes.
- Eliminacion de imagenes seleccionadas con confirmacion.
- Tests unitarios e integracion con Vitest.

## Tecnologias

- Angular 21
- TypeScript
- Tailwind CSS
- PrimeNG
- Angular CDK
- Vitest

## Instalacion

```bash
npm install
```

## Servidor de desarrollo

```bash
npm start
```

Abre `http://localhost:4200/` en el navegador.

## Tests

```bash
npm test
```

Para ejecutar tests con cobertura:

```bash
ng test --coverage --coverage-reporters=text-summary --watch=false
```

## Build

```bash
npm run build
```

El build de produccion se genera en `dist/image-gallery/`.

## Estructura principal

- `src/app/data/`: datos de ejemplo de la galeria.
- `src/app/models/`: modelo `GalleryImage`.
- `src/app/gallery/`: componente padre, estado y acciones de la galeria.
- `src/app/image-item/`: componente hijo para mostrar cada imagen.
