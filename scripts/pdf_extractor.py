#!/usr/bin/env python3
"""
pdf_extractor.py — Extractor PDF → spreads.js para el lector Linotipo
Basado en el análisis de los PDFs de Ediciones Linotipo (Cartas del Nilo)

USO:
  python3 scripts/pdf_extractor.py CartasNilo_7.pdf --carta 07
  python3 scripts/pdf_extractor.py CartasNilo_1-5.pdf --carta 01 --start 6 --end 8

SALIDA (en src/data/books/flaubert-cartas/spreads/):
  carta-07.draft.js   ← BORRADOR para revisión editorial
  carta-07-footnotes.js

FLUJO DE TRABAJO:
  1. Ejecutar este script sobre el PDF
  2. Abrir el .draft.js generado
  3. Revisar los bloques marcados con __review: true
  4. Ajustar el texto (guiones de separación de palabras, espacios, etc.)
  5. Renombrar a carta-07.js cuando esté listo
  6. Importar en App.jsx
"""

import fitz
import re
import os
import sys
import json
import argparse
from pathlib import Path

# ── Rutas del proyecto ────────────────────────────────────────────
SCRIPT_DIR   = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
IMG_OUT      = PROJECT_ROOT / 'public' / 'images'
DATA_OUT     = PROJECT_ROOT / 'src' / 'data' / 'books' / 'flaubert-cartas' / 'spreads'
IMG_OUT.mkdir(parents=True, exist_ok=True)
DATA_OUT.mkdir(parents=True, exist_ok=True)

# ── Clasificador de spans ─────────────────────────────────────────
def classify(font, size, flags, x0, page_w):
    """
    Clasifica un span de texto según su fuente, tamaño y posición.
    Basado en el análisis de fuentes de los PDFs de Linotipo:
      - ACaslonPro: cuerpo, notas al margen, referencias
      - Magister: títulos de capítulo, paginación
      - Seravek: subtítulo del libro
      - SourceSansPro / Komet: pies de imagen
    """
    in_margin = x0 > page_w * 0.63

    if size > 40:                                               return 'DROP_CAP'
    if 'Magister' in font and size > 14:                        return 'CHAPTER_TITLE'
    if 'Seravek' in font:                                       return 'SUBTITLE'
    if 'ACaslonPro-Italic' in font and size >= 11 and not in_margin:
                                                                return 'DEDICATION'
    if 'ACaslonPro-BoldItalic' in font and size >= 10:         return 'HT'
    if 'ACaslonPro' in font and 'Bold' in font and size >= 10: return 'HT'
    if 'ACaslonPro-Regular' in font and size >= 11 and not in_margin:
                                                                return 'BODY'
    if 'ACaslonPro' in font and size <= 7 and (flags & 1):     return 'FN_REF'
    if 'ACaslonPro' in font and (size <= 6.5 or size == 9.0) and in_margin:
                                                                return 'FN_TEXT'
    if 'SourceSansPro' in font or 'Komet' in font:             return 'IMG_CAP'
    return None

# ── Extracción de imágenes ────────────────────────────────────────
def save_images(page, doc, carta_num, pno):
    saved = []
    for img in page.get_images(full=True):
        xref = img[0]
        pix  = fitz.Pixmap(doc, xref)
        if pix.n > 4:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        if pix.width >= 80 and pix.height >= 60:
            fname = f"carta{carta_num}-p{pno+1:02d}-x{xref}.jpg"
            pix.save(str(IMG_OUT / fname))
            saved.append(f"/images/{fname}")
        pix = None
    return saved

# ── Extractor principal ───────────────────────────────────────────
def extract(pdf_path, carta_num, start_page=0, end_page=None):
    doc    = fitz.open(pdf_path)
    end_p  = end_page or len(doc)
    
    segments   = []  # [(tipo, texto)]
    footnotes  = {}  # {n: texto}
    all_images = []
    all_caps   = []
    
    for pno in range(start_page, end_p):
        page = doc[pno]
        pw   = page.rect.width
        
        # Guardar imágenes
        page_imgs = save_images(page, doc, carta_num, pno)
        all_images.extend(page_imgs)
        
        # Extraer texto
        for blk in page.get_text("dict")["blocks"]:
            if blk.get("type") != 0:
                continue
            x0 = blk["bbox"][0]
            
            for line in blk["lines"]:
                for span in line["spans"]:
                    t = span["text"].strip()
                    if not t:
                        continue
                    c = classify(span["font"], span["size"], span["flags"], x0, pw)
                    
                    if c in (None, 'DROP_CAP', 'SUBTITLE'):
                        continue
                    
                    if c == 'FN_TEXT':
                        m = re.match(r'^(\d+)\s+(.*)', t)
                        if m:
                            n, body = m.group(1), m.group(2).strip()
                        elif t.isdigit():
                            n, body = t, ''
                        else:
                            if footnotes:
                                n = list(footnotes.keys())[-1]
                                body = t
                            else:
                                continue
                        footnotes[n] = (footnotes.get(n, '') + ' ' + body).strip()
                    
                    elif c == 'IMG_CAP':
                        all_caps.append(t)
                    
                    elif segments and segments[-1][0] == c and c not in ('CHAPTER_TITLE', 'FN_REF'):
                        segments[-1][1] += ' ' + t
                    else:
                        segments.append([c, t])
    
    doc.close()
    return segments, footnotes, all_images, all_caps

# ── Conversión a bloques React ────────────────────────────────────
def to_react_blocks(segments, footnotes, images, captions):
    """
    Convierte la lista lineal de segmentos a bloques React.
    Resultado: lista de objetos compatible con BlockRenderer.jsx
    """
    blocks    = []
    first_p   = True
    img_idx   = 0
    cap_idx   = 0
    fn_buf    = None  # buffer de nota completa activa
    
    i = 0
    while i < len(segments):
        c, t = segments[i]
        t = ' '.join(t.split())  # normalizar espacios y guiones de línea
        
        if c == 'CHAPTER_TITLE':
            is_carta = bool(re.match(r'CARTA\s+[IVXLC]+', t))
            if is_carta:
                # Cerrar nota completa activa si había
                if fn_buf:
                    blocks.append(fn_buf)
                    fn_buf = None
                blocks.append({'type': 'chapter-title', 'text': t})
            else:
                # Abrir nota completa
                fn_buf = {
                    'type':    'full-note',
                    'trigger': f'{t} — nota completa',
                    'title':   t,
                    'blocks':  [],
                    '__review': True,
                }
                # Primera imagen disponible → portada de la nota
                if img_idx < len(images):
                    cap = captions[cap_idx] if cap_idx < len(captions) else ''
                    fn_buf['blocks'].append({
                        'type': 'note-image', 'src': images[img_idx], 'caption': cap
                    })
                    img_idx  += 1
                    cap_idx  += 1
        
        elif c == 'DEDICATION':
            if fn_buf:
                fn_buf['blocks'].append({'type': 'note-paragraph', 'text': f'[em:{t}]'})
            else:
                blocks.append({'type': 'dedication', 'text': t})
        
        elif c == 'BODY':
            # Fusionar FN_REFs siguientes
            text = t
            while i + 1 < len(segments) and segments[i+1][0] == 'FN_REF':
                text += f'[fn:{segments[i+1][1].strip()}]'
                i += 2
                if i < len(segments) and segments[i][0] == 'BODY':
                    text += ' ' + segments[i][1]
                else:
                    i -= 1
                    break
            
            block = {'type': 'paragraph', 'text': text.strip()}
            if first_p and not fn_buf:
                block['dropCap'] = True
                first_p = False
            
            if fn_buf:
                fn_buf['blocks'].append({'type': 'note-paragraph', 'text': text.strip()})
            else:
                blocks.append(block)
        
        elif c == 'HT':
            # Término destacado: integrar en el párrafo anterior
            marker = f'[ht:{t}]'
            if fn_buf and fn_buf['blocks'] and fn_buf['blocks'][-1]['type'] == 'note-paragraph':
                fn_buf['blocks'][-1]['text'] += ' ' + marker
            elif blocks and blocks[-1]['type'] == 'paragraph':
                blocks[-1]['text'] += ' ' + marker
            else:
                blocks.append({'type': 'paragraph', 'text': marker})
        
        elif c == 'IMG_CAP':
            cap = t
            # Agregar todas las líneas de caption fragmentadas
            while cap_idx < len(captions) and captions[cap_idx] != t:
                cap += ' ' + captions[cap_idx]
                cap_idx += 1
            
            # Cerrar nota completa si era su caption
            if fn_buf:
                blocks.append(fn_buf)
                fn_buf = None
            
            if img_idx < len(images):
                blocks.append({
                    'type':    'inline-note',
                    'title':   cap[:70] + ('…' if len(cap) > 70 else ''),
                    'image':   images[img_idx],
                    'caption': cap,
                    '__review': True,
                })
                img_idx += 1
        
        i += 1
    
    # Cerrar nota completa si quedó abierta
    if fn_buf:
        blocks.append(fn_buf)
    
    return blocks

# ── Generación de archivo .js ─────────────────────────────────────
def generate_js(blocks, footnotes, carta_num, spread_notes_hint):
    """Genera el contenido del archivo spreads.js en borrador."""
    
    def block_to_js(b, indent=8):
        sp = ' ' * indent
        t  = b['type']
        rv = b.get('__review', False)
        rv_comment = '  // ⚠️ REVISAR' if rv else ''
        
        if t == 'chapter-title':
            return f"{sp}{{ type: 'chapter-title', text: {json.dumps(b['text'])} }},"
        if t == 'dedication':
            return f"{sp}{{ type: 'dedication', text: {json.dumps(b['text'])} }},"
        if t == 'paragraph':
            dc = ", dropCap: true" if b.get('dropCap') else ""
            return f"{sp}{{ type: 'paragraph'{dc}, text: {json.dumps(b['text'])} }},"
        if t == 'inline-note':
            return (f"{sp}{{ type: 'inline-note',{rv_comment}\n"
                    f"{sp}  title:   {json.dumps(b.get('title',''))},\n"
                    f"{sp}  image:   {json.dumps(b.get('image',''))},\n"
                    f"{sp}  caption: {json.dumps(b.get('caption',''))} }},")
        if t == 'full-note':
            sub_lines = []
            for sb in b.get('blocks', []):
                if sb['type'] == 'note-image':
                    sub_lines.append(
                        f"          {{ type: 'note-image', src: {json.dumps(sb['src'])}, "
                        f"caption: {json.dumps(sb.get('caption',''))} }},"
                    )
                else:
                    sub_lines.append(
                        f"          {{ type: 'note-paragraph', text: {json.dumps(sb['text'])} }},"
                    )
            subs = '\n'.join(sub_lines)
            return (f"{sp}{{ type: 'full-note',{rv_comment}\n"
                    f"{sp}  trigger: {json.dumps(b['trigger'])},\n"
                    f"{sp}  title:   {json.dumps(b['title'])},\n"
                    f"{sp}  blocks: [\n{subs}\n{sp}  ] }},")
        if t == 'divider':
            return f"{sp}{{ type: 'divider' }},"
        return f"{sp}/* DESCONOCIDO: {json.dumps(b)} */,"
    
    # Agrupar bloques en spreads (dos páginas)
    # Para el borrador: todo en un solo spread derecho
    all_block_js = '\n'.join(block_to_js(b) for b in blocks)
    
    fn_entries = ',\n  '.join(
        f"{k}: {json.dumps(v)}"
        for k, v in sorted(footnotes.items(), key=lambda x: int(x[0]) if x[0].isdigit() else 0)
    )
    
    return f'''/**
 * BORRADOR — Carta {carta_num}
 * Generado automáticamente por scripts/pdf_extractor.py
 * 
 * ⚠️  REQUIERE REVISIÓN EDITORIAL antes de usar en producción:
 *   1. Revisar los bloques marcados con // ⚠️ REVISAR
 *   2. Corregir guiones de separación de línea en el texto
 *   3. Verificar que los [fn:N] corresponden a las notas correctas
 *   4. Ajustar la división en spreads (izquierda/derecha)
 *   5. Renombrar de carta-{carta_num}.draft.js a carta-{carta_num}.js
 */

// ── NOTAS AL MARGEN ────────────────────────────────────────────────────────
export const footnotes_{carta_num} = {{
  {fn_entries}
}};

// ── SPREADS ────────────────────────────────────────────────────────────────
// ⚠️  TODO: distribuir estos bloques en spreads izquierda/derecha
//           siguiendo la maquetación del PDF original
export const spreads_{carta_num} = [
  {{
    id:   0,
    left: {{ type: 'halftitle', bookTitle: 'Noticias desde El Nilo' }},
    right: {{
      pageNumber: '??',  // ⚠️ añadir número de página real
      blocks: [
{all_block_js}
      ],
    }},
  }},
  // ⚠️  Añadir más spreads según la paginación real
];
'''

# ── CLI ───────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Extrae un PDF de Linotipo a spreads.js')
    parser.add_argument('pdf',        help='Ruta al archivo PDF')
    parser.add_argument('--carta',    required=True, help='Número de carta (ej: 07)')
    parser.add_argument('--start',    type=int, default=0, help='Página de inicio (0-indexed)')
    parser.add_argument('--end',      type=int, default=None, help='Página de fin (exclusive)')
    args = parser.parse_args()
    
    print(f"Extrayendo {args.pdf} → Carta {args.carta}...")
    
    segs, fns, imgs, caps = extract(args.pdf, args.carta, args.start, args.end)
    print(f"  {len(segs)} segmentos | {len(fns)} notas | {len(imgs)} imágenes")
    
    blocks = to_react_blocks(segs, fns, imgs, caps)
    
    review_n = sum(1 for b in blocks if b.get('__review'))
    print(f"  {len(blocks)} bloques React ({review_n} requieren revisión)")
    
    # Generar el .js
    js_content = generate_js(blocks, fns, args.carta, {})
    out_path   = DATA_OUT / f"carta-{args.carta}.draft.js"
    out_path.write_text(js_content, encoding='utf-8')
    print(f"\n✓ Borrador escrito en: {out_path}")
    print(f"  Imágenes guardadas en: {IMG_OUT}/carta{args.carta}-*.jpg")
    print(f"\nPróximo paso: revisar el borrador y renombrar a carta-{args.carta}.js")

if __name__ == '__main__':
    main()
