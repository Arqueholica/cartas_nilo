/**
 * chrome — qué se imprime en la cabecera y en el pie de cada página
 *
 * El espacio de ambas franjas está reservado siempre, aunque las
 * ranuras estén vacías. Para empezar a usar la cabecera basta con
 * cambiar un `null` por un token o por un texto literal; no hay que
 * tocar ningún componente.
 *
 * Tokens disponibles (ver `components/book/pageChrome.js`):
 *   book.title · book.author · book.imprint
 *   chapter.label · chapter.title · chapter.to · chapter.date
 *   section · folio
 *
 * verso = página izquierda (folio par) · recto = derecha (folio impar)
 *
 * Disposición clásica, para cuando se decida activarla:
 *   head.verso.center = 'book.title'
 *   head.recto.center = 'chapter.label'
 */
export const chrome = {
  head: {
    verso: { left: null, center: null, right: null },
    recto: { left: null, center: null, right: null },
  },
  foot: {
    verso: { left: null, center: 'folio', right: null },
    recto: { left: null, center: 'folio', right: null },
  },
};

export default chrome;
