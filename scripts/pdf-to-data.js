#!/usr/bin/env node
/**
 * pdf-to-data.js — Extractor PDF → archivos de datos React
 * Ediciones Linotipo
 *
 * USO:
 *   node scripts/pdf-to-data.js CartasNilo_7.pdf --carta 07
 *   node scripts/pdf-to-data.js CartasNilo_1-5.pdf --carta 01 --pages 7-8
 *
 * SALIDA:
 *   src/data/books/flaubert-cartas/spreads/carta-07.js   (REVISAR antes de usar)
 *   src/data/books/flaubert-cartas/footnotes-07.js
 *   public/images/carta07-*.jpg
 *
 * REQUIERE: pip install pymupdf (Python) — este script llama a Python internamente
 * O instalar: npm install pdfjs-dist
 *
 * NOTA: Este script genera un borrador que NECESITA REVISIÓN EDITORIAL.
 * Las marcas ⚠️ __review indican bloques que hay que verificar manualmente.
 * Ver GUIA_PRODUCCION.md para el flujo completo.
 */

// Este script se completa cuando lleguen los archivos ICML de InDesign.
// Con ICML la extracción es directa (estilos de párrafo → tipos de bloque).
// Con PDF es una extracción heurística que requiere revisión.
//
// El extractor Python está en scripts/pdf_extractor.py

console.log('Ver scripts/pdf_extractor.py para la extracción real desde Python.');
console.log('Cuando tengáis los ICML de InDesign, este script se simplifica enormemente.');
