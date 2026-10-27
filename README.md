# Noticias desde El Nilo — lector interactivo
**Ediciones Linotipo · React + Vite**

Libro completo: 10 cartas de Gustave Flaubert, 150 notas, glosario y
galería, con paginación calcada de la edición impresa.

## Arranque

```bash
npm install
npm run dev
```

## Documentación

| Archivo | Para quién |
|---|---|
| `MANUAL.md` | Referencia técnica completa de los bloques |
| `MANUAL_BREVE.md` | Guía de 2 minutos para el equipo editorial |
| `GUIA_PRODUCCION.md` | Especificaciones de vídeo, audio, 3D, animación |
| `REVISION_TEXTO.md` | Variantes que el PDF impuso sobre el DOCX (revisar) |

## Regenerar el libro desde los materiales

```bash
LINOTIPO_SRC=/ruta/a/los/materiales python3 scripts/build_book.py
```

Espera encontrar `pdfs/PDF_Cartas del Nilo/` y `seleccion/Selección Cartas/`.

## Estado

- [x] Motor de bloques (texto, notas, multimedia)
- [x] Portada, glosario y galería como páginas de libro
- [x] Libro completo de 10 cartas
- [ ] Tema visual por colección (datos en vez de CSS)
- [ ] Supabase: cuentas y notas en la nube
- [ ] Stripe: pagos
- [ ] PWA offline · exportación EPUB
