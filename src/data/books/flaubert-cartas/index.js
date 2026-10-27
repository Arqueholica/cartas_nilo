/**
 * ENSAMBLADO DEL LIBRO — «Noticias desde El Nilo»
 *
 * Expone el contenido como listas planas de bloques por carta.
 * La repartición en páginas NO se hace aquí: la calcula el lector en
 * tiempo real midiendo lo que cabe en la caja de texto, de modo que el
 * texto nunca desborda aunque se cambie el tamaño de letra.
 *
 * La edición en línea tiene su propia numeración, independiente de la
 * del PDF impreso.
 *
 * Añadir una carta = importarla aquí y añadirla a CARTAS.
 */
import { meta } from './meta';
import { glossary } from './glossary';
import { album } from './album';

import { meta01, footnotes01, spreads01 } from './spreads/carta-01';
import { meta02, footnotes02, spreads02 } from './spreads/carta-02';
import { meta03, footnotes03, spreads03 } from './spreads/carta-03';
import { meta04, footnotes04, spreads04 } from './spreads/carta-04';
import { meta05, footnotes05, spreads05 } from './spreads/carta-05';
import { meta06, footnotes06, spreads06 } from './spreads/carta-06';
import { meta07, footnotes07, spreads07 } from './spreads/carta-07';
import { meta08, footnotes08, spreads08 } from './spreads/carta-08';
import { meta09, footnotes09, spreads09 } from './spreads/carta-09';
import { meta10, footnotes10, spreads10 } from './spreads/carta-10';

const RAW = [
  { meta: meta01, footnotes: footnotes01, spreads: spreads01 },
  { meta: meta02, footnotes: footnotes02, spreads: spreads02 },
  { meta: meta03, footnotes: footnotes03, spreads: spreads03 },
  { meta: meta04, footnotes: footnotes04, spreads: spreads04 },
  { meta: meta05, footnotes: footnotes05, spreads: spreads05 },
  { meta: meta06, footnotes: footnotes06, spreads: spreads06 },
  { meta: meta07, footnotes: footnotes07, spreads: spreads07 },
  { meta: meta08, footnotes: footnotes08, spreads: spreads08 },
  { meta: meta09, footnotes: footnotes09, spreads: spreads09 },
  { meta: meta10, footnotes: footnotes10, spreads: spreads10 },
];

/** Aplana los spreads precalculados en una sola lista de bloques */
function flatten(spreads) {
  const out = [];
  for (const sp of spreads) {
    for (const side of ['left', 'right']) {
      const page = sp[side];
      if (!page || !page.blocks) continue;
      for (const block of page.blocks) {
        out.push({ ...block });
      }
    }
  }
  return out;
}

/** Notas citadas en un conjunto de bloques */
export function notesIn(blocks) {
  const found = [];
  for (const b of blocks || []) {
    for (const t of [b.text, b.dedication, b.location].filter(Boolean)) {
      for (const m of String(t).matchAll(/\[fn:(\d+)\]/g)) found.push(Number(m[1]));
    }
  }
  return [...new Set(found)].sort((a, b) => a - b);
}

/** Las 10 cartas, cada una con su lista plana de bloques */
export const letters = RAW.map((c) => ({
  id:        c.meta.id,
  number:    c.meta.number,
  title:     c.meta.title,
  date:      c.meta.place,
  footnotes: c.footnotes,
  blocks:    flatten(c.spreads),
}));

/* ─────────── Portada y contraportada (páginas únicas) ─────────── */
export const coverPage = {
  type: 'cover',
  blocks: [
    { type: 'cover-ornament', symbol: '❧ ❧ ❧' },
    { type: 'cover-title',   text: meta.title },
    { type: 'cover-image',   src: '/images/mapa-africa-1850.jpg',
      caption: 'Mapa de África en 1850' },
    { type: 'cover-author',  text: meta.author },
    { type: 'cover-imprint', text: meta.imprint },
  ],
};

export const backCoverPage = {
  type: 'end-page',
  author: meta.author,
  series: meta.title,
  label:  `${meta.imprint} · ${meta.year}`,
};

/* ─────────── Galería y glosario, aplanados con su carta ─────────── */
export const galleryItems = album.sections.flatMap((s) =>
  s.items.map((i) => ({ ...i, ref: s.carta })));

export const glossaryFlat = glossary.sections.flatMap((s) =>
  s.entries.map((e) => ({ ...e, ref: s.carta })));

export const bookMeta = meta;
export const cartas   = letters.map(({ id, number, title, date }) =>
  ({ id, number, title, date }));

/**
 * Todas las notas del libro, indexadas por carta:
 *   { 'VI': { 1: {text, …}, … }, … }
 * Permite resolver las remisiones del tipo
 * «véase la nota 11 de la Carta V» sin salir de donde se está leyendo.
 */
export const allFootnotes = Object.fromEntries(
  letters.map((L) => [L.number, L.footnotes]));
