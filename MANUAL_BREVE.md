# Cómo preparar el material — guía breve

Para el equipo editorial. Si sigues estas cuatro convenciones al escribir
en Word, el texto pasa al libro digital sin retoques.

---

## 1. Los tres tipos de nota

El libro distingue tres maneras de anotar. Elegir la adecuada es la
decisión editorial más importante.

**Nota al margen** — la nota breve de contexto de siempre.
Se escribe en el documento de NOTAS y se llama desde el texto con un
**número en superíndice**. En el lector aparece en una columna lateral
que se abre al pulsar el número.

**Nota integrada** — cuando la nota lleva ilustración.
Se escribe igual, pero dentro del texto de la nota se añade:

> `[Imagen: nombre-del-archivo / Pie de foto: Autor, Título (año).]`

En el lector se abre dentro de la propia página, con su imagen.

**Nota completa** — el texto largo con imagen que en el impreso ocupa
una página entera con título propio. Se mantiene igual: título,
ilustración y varios párrafos.

---

## 2. Los superíndices: cifra o letra

Esta distinción es la que el sistema usa para clasificar. No se puede
improvisar.

| Superíndice | Significa | Va al documento |
|---|---|---|
| **Cifra** (1, 2, 3…) | Nota de contexto | NOTAS |
| **Letra** (a, b, c…) | Término de glosario | GLOSARIO |

Las letras siguen el orden en que aparecen las entradas del glosario:
la primera entrada es la `a`, la segunda la `b`, y así.

En el lector, las palabras marcadas con letra salen resaltadas y, al
pulsarlas, llevan a su definición en el glosario.

---

## 3. Cursivas

Se escriben como cursivas normales de Word. El sistema las reconoce solo.
No hace falta marcarlas de ninguna manera especial.

---

## 4. El glosario

Una entrada por párrafo, con este formato exacto:

```
palabra: definición de la palabra.
```

Los dos puntos y el espacio son lo que el sistema busca para separar el
término de su definición.

---

## Archivos por carta

Cada carpeta de carta debería contener:

```
01_Carta NN_TEXTO_vd.docx       ← el texto de la carta
02_Carta NN_NOTAS_vd.docx       ← las notas, como lista numerada de Word
03_Carta NN_GLOSARIO_vd.docx    ← palabra: definición
04_Carta NN_ALBUM MDC_vd.docx   ← imágenes y pies para la galería
02_Imagenes_CARTA NN_vd/        ← las imágenes originales
```

Dos detalles que ahorran trabajo:

- **Las notas, como lista numerada de Word** (la numeración automática),
  no escribiendo el número a mano. Así la nota 7 es siempre la séptima,
  aunque se inserte una nueva en medio.
- **El nombre del archivo de imagen en la marca `[Imagen: …]` debe
  coincidir con el nombre real del archivo.** Si no coincide, el sistema
  intenta adivinarlo por el pie de foto, pero no siempre acierta.

---

## Qué pasa con el PDF

El PDF maquetado sigue mandando en la redacción final: si una frase
cambió al maquetar, esa es la versión que se publica. El sistema compara
ambos y deja constancia de cada diferencia en un informe, para que se
pueda revisar.

Las notas que se recortaron del impreso por falta de espacio **sí se
conservan** en el libro digital, señaladas como «solo digital».
