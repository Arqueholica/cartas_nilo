# Manual de la plantilla — Ediciones Linotipo

Referencia técnica del sistema de bloques del lector.
Para la versión breve destinada a colaboradores, véase `MANUAL_BREVE.md`.

---

## 1. Cómo está organizado el proyecto

```
src/
├── data/books/flaubert-cartas/   ← CONTENIDO (aquí se edita todo)
│   ├── index.js                  ← ensambla el libro completo
│   ├── meta.js                   ← título, autor, índice de cartas
│   ├── glossary.js               ← glosario, agrupado por carta
│   ├── album.js                  ← galería, agrupada por carta
│   └── spreads/carta-NN.js       ← una carta = un archivo
│
├── components/                   ← MOTOR (no se toca para añadir contenido)
│   └── book/blocks/              ← un componente por tipo de bloque
│       └── BlockRenderer.jsx     ← el conmutador central
│
└── hooks/                        ← navegación y notas del lector

scripts/build_book.py             ← convierte PDF + DOCX en archivos de datos
```

La regla que sostiene todo: **los componentes no conocen el contenido**.
Reciben objetos de datos y los dibujan. Añadir una carta o un libro entero
no requiere tocar ni un componente.

---

## 2. Anatomía de una carta

Cada archivo `carta-NN.js` exporta tres cosas:

```js
export const metaNN      = { id, number, title, place, firstPage };
export const footnotesNN = { 1: { text, image?, caption?, inPrint? }, … };
export const spreadsNN   = [ { left: {…}, right: {…} }, … ];
```

Un **spread** es una doble página. Cada lado es una página con su número
y su lista de bloques:

```js
{
  left: {
    pageNumber: '7',
    blocks: [
      { type: 'chapter-header', title: 'CARTA I',
        dedication: 'A Emmanuel Vasse[fn:1]',
        location: 'El Cairo, 17 de enero de 1850' },
      { type: 'paragraph', dropCap: true, text: 'Seguro que te sorprendes…' },
    ],
  },
  right: { pageNumber: '8', blocks: [ … ] },
}
```

---

## 3. Marcadores de texto

Se escriben dentro del campo `text` de cualquier bloque.

| Marcador | Efecto en el lector | Ejemplo |
|---|---|---|
| `[fn:N]` | Superíndice que abre la nota N en el panel lateral | `…de Cáncer[fn:4].` |
| `[ht:X]` | Término destacado; si existe en el glosario, es clicable y salta a su definición | `el [ht:khamsin] sopló` |
| `[em:X]` | Cursiva | `a bordo de la [em:canga]` |

Estos tres marcadores son la única sintaxis que hay que aprender. Tienen
equivalente directo en EPUB (`<a epub:type="noteref">`, `<span>`, `<em>`),
por lo que el mismo dato sirve para la web, la app y el ebook.

**Regla de oro:** el texto se escribe plano y los marcadores se insertan
en su sitio. Nunca se escribe HTML.

---

## 4. Catálogo de bloques

### Texto

| `type` | Campos | Uso |
|---|---|---|
| `paragraph` | `text`, `dropCap?` | Párrafo de cuerpo. `dropCap` pone capitular. |
| `verse` | `text`, `translation?` | Cita en verso, con traducción opcional debajo. |
| `chapter-header` | `title`, `dedication`, `location` | Cabecera de carta. |
| `section-title` | `text` | Título interior (apertura de una sección). |
| `divider` | `style?` | Separador. `style: 'ornament'` da `❧ ❧ ❧`. |
| `end-note` | `text` | Línea de cierre («Fin de la Carta VI»). |

### Notas editoriales — los tres tipos

**Nota al margen** → no es un bloque. Se declara en `footnotesNN` y se
invoca desde el texto con `[fn:N]`. Aparece en el panel lateral derecho.

```js
export const footnotes06 = {
  4: { text: 'El Trópico de Cáncer se encuentra a 23°26′…' },
  7: { text: 'El escultor Jean-Jacques Pradier…', inPrint: false },
};
```
`inPrint: false` marca las notas que no entraron en la edición impresa;
el lector las muestra con la etiqueta «solo digital».

**Nota integrada** → bloque desplegable dentro de la página, con
ilustración. Conserva su texto en la página y no pasa al panel.

```js
{ type: 'inline-note',
  title:   'Mapa de África en 1850',
  image:   '/images/mapa-africa-1850.jpg',
  caption: 'Editado por Thomas Milner a partir de August Petermann.' }
```
Admite `images: [...]` para varias y `gallery: true` para ponerlas en fila.

**Nota completa** → ocupa una página entera del corpus, siempre
desplegada. El título lo pone la propia página, así que la anterior no
debe llevar un `section-title` con ese mismo texto. Se reconoce por un tinte propio del tema, una etiqueta
«Nota» y el texto a dos columnas, como en el impreso. El lector pasa
página y la encuentra abierta; no hay que pulsar nada.

```js
{ type: 'full-note',
  title:   'La ceremonia del Doseh',
  blocks: [
    { type: 'note-image', src: '/images/doseh.jpg', caption: 'Alexandre Bida, 1855.' },
    { type: 'note-paragraph', text: 'Aunque Flaubert describe muy bien…' },
  ] }
```

### Multimedia

Todos se cargan de forma diferida: solo se descargan cuando el lector
llega a la página que los contiene.

| `type` | Campos principales |
|---|---|
| `image` | `src`, `caption?` |
| `video` | `src`, `poster?`, `caption?`, `subtitles?`, `loop?`, `autoplay?` |
| `audio` | `src`, `title?`, `caption?` |
| `model-3d` | `src` (.glb), `poster?`, `autoRotate?`, `ar?`, `hotspots?` |
| `lottie` | `src` (.json), `autoplay?`, `loop?`, `speed?` |
| `panorama` | `src` (equirrectangular), `pitch?`, `yaw?`, `hfov?` |
| `image-sequence` | `src` (webp/gif) **o** `frames: []` + `fps?` |

Las especificaciones de producción de cada formato están en
`GUIA_PRODUCCION.md`.

### Portada, glosario y galería

La **portada** es siempre la primera página y admite composición libre:

```js
{ type: 'cover',
  background?: '/images/fondo.jpg',
  ambientAudio?: '/assets/audio/nilo.mp3',
  blocks: [
    { type: 'cover-ornament', symbol: '❧ ❧ ❧' },
    { type: 'cover-title',   text: 'Noticias desde El Nilo' },
    { type: 'cover-image',   src: '/images/mapa-africa-1850.jpg' },
    { type: 'cover-author',  text: 'Gustave Flaubert' },
    { type: 'cover-imprint', text: 'Ediciones Linotipo' },
  ] }
```
También acepta cualquier bloque multimedia, de modo que una portada puede
llevar animación o sonido.

El **glosario** y la **galería** se paginan solos como páginas de libro.
No se declaran en las cartas: se construyen en `index.js` a partir de
`glossary.js` y `album.js`, y se colocan al final del libro.

---

## 5. Añadir contenido

### Una carta nueva

1. Crear `src/data/books/flaubert-cartas/spreads/carta-11.js` con las tres
   exportaciones (`meta11`, `footnotes11`, `spreads11`).
2. Importarla en `index.js` y añadirla al array `CARTAS`.
3. Añadir su entrada en `meta.js`.

No hay que tocar ningún componente.

### Un tipo de bloque nuevo

1. Crear el componente en `src/components/book/blocks/`.
2. Importarlo en `BlockRenderer.jsx` y añadir su `case`.

Nada más cambia en el proyecto.

### Un libro nuevo

Duplicar la carpeta `data/books/<slug>/` con su propio `meta`, `index`,
`glossary`, `album` y carpeta `spreads/`. El motor es el mismo.

---

## 6. El conversor `scripts/build_book.py`

Convierte los materiales editoriales en archivos de datos.

```bash
python3 scripts/build_book.py
```

**Qué toma de cada fuente**

| Fuente | Aporta |
|---|---|
| PDF (maquetación final) | redacción definitiva, paginación, páginas de nota completa |
| DOCX `TEXTO` | texto limpio y posición exacta de cada marcador |
| DOCX `NOTAS` | todas las notas, con sus ilustraciones |
| DOCX `GLOSARIO` | entradas `palabra: definición` |
| DOCX `ALBUM` | imágenes y pies de la galería |
| Carpetas de imágenes | originales en alta resolución |

**Convenciones que espera de los DOCX**

- Llamada de nota → superíndice con **cifra**
- Término de glosario → superíndice con **letra** (a, b, c… en el orden
  en que aparecen las entradas del glosario)
- Énfasis → run en cursiva
- Ilustración de una nota → dentro del texto de la nota:
  `[Imagen: nombre_archivo / Pie de foto: …]`

Respetar estas convenciones es lo que hace que la conversión sea exacta
y no dependa de adivinar.

**Salida de control:** `REVISION_TEXTO.md` lista todas las variantes de
redacción que el PDF impuso sobre el DOCX, para revisión editorial.

---

## 7. Composición de la página

La página tiene una estructura fija e idéntica en todo el libro:

```
.pg          la hoja
  .pg-box    la caja de texto — medidas constantes
  .pn        el folio — siempre a la misma altura
```

**El texto nunca desborda la caja.** `Paginator.jsx` mide la altura real
de cada bloque en una caja oculta con las mismas medidas y tipografía
que la página, y reparte el contenido por lo que cabe. Se recalcula al
cambiar el cuerpo de letra o el tamaño de la ventana.

**La única excepción** son las ilustraciones con su nota integrada, que
pueden sobresalir del ancho de la caja. Además, al desplegar una nota
integrada la caja permite desplazarse para verla entera: en lectura
normal no aparece barra alguna, porque el texto siempre cabe.

La edición en línea tiene **su propia numeración**, correlativa e
independiente de la del PDF impreso.

### Páginas únicas

La portada y el colofón se presentan como página sola, centrada y sin
lomo, como la tapa de un libro físico. Tienen **las mismas medidas que
cualquier otra página**: lo que cambia es que van solas. Se declaran con `single: true`:

```js
{ single: true, kind: 'cover', page: coverPage }
```

### Marcador de lectura

`useBookmark.js` guarda dos cosas por libro:

- **automático** — la última página leída; al volver, el lector ofrece
  retomarla
- **manual** — una cinta que nace del lomo y cae entre las dos páginas,
  como la de un libro de verdad. Se pone y se quita desde la barra
  superior y lleva de vuelta a ese punto con un clic

### Remisiones entre notas

Cuando una nota dice «véase la nota 11 de la Carta V», el lector lo
detecta y lo convierte en un enlace. Al pulsarlo, **esa nota se despliega
ahí mismo**, sangrada y con tinte propio, encabezada por su procedencia.
El lector no se mueve de donde está.

Se reconocen las variantes habituales: «véase nota N de la Carta X»,
«véase la nota N…», «véase en la nota N…». El componente que lo resuelve
es `NoteBody.jsx`.

### Enfoque de notas

Al pulsar una llamada de nota, el panel se abre, se desplaza hasta esa
nota y la resalta mientras difumina las demás durante cinco segundos.

> Las notas del lector están desactivadas a la espera de definir cómo
> deben funcionar. El código del hook `useNotes.js` sigue disponible.

---

## 8. Decisiones vigentes

- **Las notas se conservan todas.** El impreso recortó unas 60 por
  espacio; en digital se mantienen y las no impresas se marcan
  `inPrint: false`.
- **La paginación se calcula por lo que cabe**, no por la del PDF. El
  folio conserva la referencia a la página impresa.
- **Glosario y galería van al final**, subdivididos por carta, con una
  etiqueta que indica la procedencia de cada entrada.
