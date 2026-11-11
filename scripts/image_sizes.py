#!/usr/bin/env python3
"""
image_sizes.py — índice de medidas de las imágenes del libro

El paginador mide el contenido en una caja oculta antes de repartirlo
en páginas. Las imágenes de esa caja no llegan a descargarse (están
fuera de pantalla y se cargan de forma diferida), así que sin más datos
medirían cero de alto y las páginas con ilustraciones se desbordarían.

Este script lee el ancho y el alto de cada imagen de `public/images/`
y escribe un índice en `src/data/books/<libro>/imageSizes.js`. Los
componentes pasan esas medidas a la etiqueta <img> (atributos width y
height), y el navegador reserva el hueco exacto antes de descargarla:
la medición es exacta y, de paso, la página no salta al cargar.

Uso:
    python3 scripts/image_sizes.py                    # libro por defecto
    python3 scripts/image_sizes.py --book otro-libro

Hay que volver a ejecutarlo cada vez que se añada o cambie una imagen.
"""
import argparse
import json
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Falta Pillow: pip install pillow')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--book', default='flaubert-cartas')
    ap.add_argument('--images', default=os.path.join(ROOT, 'public', 'images'))
    args = ap.parse_args()

    sizes = {}
    errors = []
    for dirpath, _, files in os.walk(args.images):
        for name in sorted(files):
            if os.path.splitext(name)[1].lower() not in EXTS:
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, os.path.join(ROOT, 'public')).replace(os.sep, '/')
            try:
                with Image.open(path) as im:
                    sizes['/' + rel] = [im.width, im.height]
            except Exception as e:      # imagen dañada o formato no legible
                errors.append(f'{rel}: {e}')

    out = os.path.join(ROOT, 'src', 'data', 'books', args.book, 'imageSizes.js')
    body = json.dumps(dict(sorted(sizes.items())), ensure_ascii=False, indent=2)
    with open(out, 'w', encoding='utf-8') as f:
        f.write('/**\n'
                ' * imageSizes — ancho y alto de cada imagen del libro, en píxeles.\n'
                ' *\n'
                ' * GENERADO por scripts/image_sizes.py. No editar a mano: volver a\n'
                ' * ejecutar el script cuando se añada o cambie una imagen.\n'
                ' */\n'
                f'const imageSizes = {body};\n\n'
                'export default imageSizes;\n')

    print(f'{len(sizes)} imágenes → {os.path.relpath(out, ROOT)}')
    for e in errors:
        print('  ⚠', e)


if __name__ == '__main__':
    main()
