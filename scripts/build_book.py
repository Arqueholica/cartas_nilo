#!/usr/bin/env python3
"""
build_book.py — Construye el libro completo «Noticias desde El Nilo»
a partir de los materiales editoriales de Ediciones Linotipo.

FUENTES
  · PDFs  (maquetación final) → autoridad de texto, paginación y orden
  · DOCX  (Selección Cartas)  → texto limpio, marcadores exactos, notas
                                completas, glosario y álbum

CONVENCIÓN DE MARCADO EN LOS DOCX (descubierta y verificada)
  · superíndice con CIFRA  → nota de contexto        → [fn:N]
  · superíndice con LETRA  → entrada de glosario     → [ht:término]
  · run en cursiva         → énfasis                 → [em:texto]
  · [Imagen: archivo / Pie de foto: …] dentro de una nota
                           → nota integrada con ilustración

DECISIONES EDITORIALES APLICADAS
  · Se conservan TODAS las notas del DOCX; las que no entraron en la
    maquetación impresa se marcan con  inPrint: false
  · La paginación calca la del PDF (una página de PDF = una página del lector)
  · Glosario y galería van al final del libro, subdivididos por carta

USO
  python3 scripts/build_book.py
"""

import os, re, glob, json, shutil, unicodedata, difflib
from pathlib import Path

import docx
from docx.oxml.ns import qn
import pymupdf

# ─────────────────────────── rutas ───────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT    = SCRIPT_DIR.parent
IMG_OUT    = PROJECT / 'public' / 'images'
DATA_OUT   = PROJECT / 'src' / 'data' / 'books' / 'flaubert-cartas'
SPREAD_OUT = DATA_OUT / 'spreads'

SRC = Path(os.environ.get(
    'LINOTIPO_SRC',
    '/tmp/claude-0/-home-claude/d805acd6-a3d3-5992-82ff-c2306fa4f5a9/scratchpad'))
PDF_DIR = SRC / 'pdfs' / 'PDF_Cartas del Nilo'
SEL_DIR = next(iter(glob.glob(str(SRC / 'seleccion' / '*'))), None)

for d in (IMG_OUT, SPREAD_OUT):
    d.mkdir(parents=True, exist_ok=True)

# ─────────────────── mapa carta → páginas de PDF ───────────────────
# (rangos 1-indexados, inclusivos; verificados por detección de títulos)
CARTAS = {
    1:  dict(pdf='CartasNilo_1-5.pdf', pages=(7, 8),   num='I',    to='A Emmanuel Vasse'),
    2:  dict(pdf='CartasNilo_1-5.pdf', pages=(9, 14),  num='II',   to='A su madre'),
    3:  dict(pdf='CartasNilo_1-5.pdf', pages=(15, 18), num='III',  to='A su madre'),
    4:  dict(pdf='CartasNilo_1-5.pdf', pages=(19, 21), num='IV',   to='A su madre'),
    5:  dict(pdf='CartasNilo_1-5.pdf', pages=(23, 27), num='V',    to='A su madre'),
    6:  dict(pdf='CartasNilo_6.pdf',   pages=(1, 16),  num='VI',   to='A Louis Bouilhet'),
    7:  dict(pdf='CartasNilo_7.pdf',   pages=(1, 4),   num='VII',  to='A su madre'),
    8:  dict(pdf='CartasNilo_8.pdf',   pages=(1, 3),   num='VIII', to='A su madre'),
    9:  dict(pdf='CartasNilo_9.pdf',   pages=(3, 8),   num='IX',   to='A su madre'),
    10: dict(pdf='CartasNilo_10.pdf',  pages=(1, 3),   num='X',    to='A su madre'),
}

IMG_RE = re.compile(r'\[Imagen\s*:(.*?)(?:/\s*Pie de foto\s*:(.*?))?\]', re.S | re.I)


# ═══════════════════════ utilidades ═══════════════════════
def slug(s):
    s = unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return re.sub(r'-{2,}', '-', s)[:60]


def fold(s):
    """Clave de comparación: sin acentos, sin signos, minúsculas."""
    s = unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())


def clean(s):
    return ' '.join(str(s).split())


def merge_runs(par):
    """Agrupa runs contiguos con el mismo formato (Word los fragmenta)."""
    out = []
    for r in par.runs:
        if not r.text:
            continue
        sup = bool(r.font.superscript)
        ita = bool(r.italic)
        if out and out[-1][0] == sup and out[-1][1] == ita:
            out[-1][2] += r.text
        else:
            out.append([sup, ita, r.text])
    return out


def esc(s):
    return json.dumps(s, ensure_ascii=False)


# ═══════════════════ lectura de los DOCX ═══════════════════
def carta_dir(n):
    hits = glob.glob(f'{SEL_DIR}/Carta {n:02d}*')
    return hits[0] if hits else None


def find_docx(n, kind):
    """Busca por NOMBRE DE ARCHIVO, nunca por la carpeta contenedora
    (las carpetas se llaman «01_Textos_CARTA NN», lo que causaría
    falsos positivos con el tipo TEXTO)."""
    base = carta_dir(n)
    if not base:
        return None
    hits = [f for f in glob.glob(base + '/*/*.docx')
            if kind in os.path.basename(f).upper()]
    return hits[0] if hits else None


def marker_spans(text):
    """Rangos de caracteres ocupados por marcas [Imagen: … ] en el texto."""
    spans = [m.span() for m in IMG_RE.finditer(text)]
    if not spans:                       # marca abierta sin cerrar
        m = re.search(r'\[Imagen\s*:', text, re.I)
        if m:
            spans = [(m.start(), len(text))]
    return spans


def runs_markup(par, drop=()):
    """
    Reconstruye el párrafo con marcadores [em:…], omitiendo los rangos
    de caracteres indicados en `drop` (calculados sobre par.text).
    """
    out, pos = [], 0
    for sup, ita, text in merge_runs(par):
        start, end = pos, pos + len(text)
        pos = end
        if sup:
            continue
        keep = ''.join(ch for i, ch in enumerate(text, start)
                       if not any(a <= i < b for a, b in drop))
        if not keep:
            continue
        out.append(f'[em:{clean(keep)}]' if ita and keep.strip() else keep)
    return clean(''.join(out))


def strip_markers(s):
    """Quita los marcadores dejando el texto visible."""
    return clean(re.sub(r'\[(?:fn|ht|em):([^\]]*)\]', r'\1', s))


def tidy(s):
    """Limpia restos de marcas troceadas y espacios sobrantes."""
    s = re.sub(r'\[Imagen[^\]]*\]?', '', s, flags=re.I)
    s = re.sub(r'\s*\(\d{4}\)\s*\.?\s*\]', '', s)     # «(1881).]»
    s = re.sub(r'\s*\.?\s*\]\s*$', '', s)             # «.]» final
    s = re.sub(r'\s+([,.;:!?»)])', r'\1', s)
    return clean(s)


def read_texto(path):
    """
    Devuelve (meta, paragraphs).
      meta        → {title, dedication, place}
      paragraphs  → lista de strings con marcadores [fn:N] [ht:X] [em:X]
    """
    d = docx.Document(path)
    meta, paras = {}, []

    for p in d.paragraphs:
        raw = clean(p.text)
        if not raw:
            continue

        # Cabecera de la carta
        if not paras and re.match(r'^Carta\s+[IVXLC]+\s*$', raw, re.I):
            meta['title'] = raw.upper()
            continue
        if not paras and 'dedication' not in meta and re.match(r'^A\s+\w', raw):
            # conserva la llamada de nota del destinatario, si la hay
            sup = ''.join(t for s, i, t in merge_runs(p) if s).strip()
            ded = re.sub(r'\d+$', '', raw).strip()
            digits = re.findall(r'\d+', sup)
            if digits:
                ded = ded + '[fn:' + digits[0] + ']'
            meta['dedication'] = ded
            continue
        if not paras and 'place' not in meta and re.search(r'\b18\d\d\b', raw):
            # conserva las llamadas de nota del lugar («File¹, 15 de abril…»)
            place, pos = [], 0
            for sup, ita, text in merge_runs(p):
                if sup:
                    for num in re.findall(r'\d+', text):
                        place.append('[fn:' + num + ']')
                else:
                    place.append(text)
            meta['place'] = clean(''.join(place))
            continue

        # Cuerpo: reconstruir con marcadores
        tokens = []
        for sup, ita, text in merge_runs(p):
            t = text
            if sup:
                s = t.strip()
                if not s:
                    continue
                if s[0].isdigit():                       # nota de contexto
                    for num in re.findall(r'\d+', s):
                        tokens.append(('fn', num))
                else:                                    # entrada de glosario
                    for letter in re.findall(r'[a-zñ]', s.lower()):
                        tokens.append(('gl', letter))
            elif ita:
                if t.strip():
                    tokens.append(('em', t))
            else:
                tokens.append(('tx', t))

        paras.append(tokens_to_text(tokens))

    return meta, [x for x in paras if x.strip()]


def tokens_to_text(tokens):
    """
    Convierte la lista de tokens en texto con marcadores.
    Una marca de glosario ('gl') convierte la palabra anterior en [ht:palabra].
    """
    out = []
    for kind, val in tokens:
        if kind == 'tx':
            out.append(val)
        elif kind == 'em':
            out.append(f'[em:{clean(val)}]')
        elif kind == 'fn':
            out.append(f'[fn:{val}]')
        elif kind == 'gl':
            # Marcar como término de glosario la última palabra emitida
            for i in range(len(out) - 1, -1, -1):
                chunk = out[i]
                if not chunk.strip():
                    continue
                m = re.match(r'^\[em:(.+)\]$', chunk)
                if m:                                    # ya era cursiva
                    out[i] = f'[ht:{m.group(1)}]'
                    break
                m = re.search(r'([\wáéíóúüñÁÉÍÓÚÑ\-]+)(\W*)$', chunk)
                if m:
                    word, tail = m.group(1), m.group(2)
                    out[i] = chunk[:m.start(1)] + f'[ht:{word}]' + tail
                    break
    txt = ''.join(out)
    txt = re.sub(r'\s+([,.;:!?»)])', r'\1', txt)
    txt = re.sub(r'([«(])\s+', r'\1', txt)
    return clean(txt)


def read_notas(path):
    """
    Devuelve {n: {text, image, caption}} con TODAS las notas del DOCX.
    Las marcas [Imagen: … / Pie de foto: …] se extraen del texto.
    """
    if not path:
        return {}
    d = docx.Document(path)
    notes, n = {}, 0
    for p in d.paragraphs:
        numbered = p._p.pPr is not None and p._p.pPr.numPr is not None
        if not numbered:
            continue
        n += 1
        raw = p.text
        img = cap = None
        m = IMG_RE.search(raw)
        if m:
            img = clean(m.group(1))
            cap = tidy(m.group(2) or '')
        body = tidy(runs_markup(p, marker_spans(raw)))
        notes[n] = dict(text=body, image=img, caption=cap)
    return notes


def read_glosario(path):
    """Devuelve [{term, definition}] en el orden del documento (= a, b, c…)."""
    if not path:
        return []
    d = docx.Document(path)
    entries = []
    for p in d.paragraphs:
        raw = clean(p.text)
        m = re.match(r'^([\wáéíóúüñÁÉÍÓÚÑ][\wáéíóúüñ \-]{0,28}?):\s+(\S.*)$', raw)
        if not m or raw.upper().startswith('GLOSARIO'):
            continue
        joined = tidy(runs_markup(p, marker_spans(p.text)))
        mm = re.match(r'^(.*?):\s+(.*)$', joined)
        term, definition = (mm.group(1), mm.group(2)) if mm else (m.group(1), m.group(2))
        entries.append(dict(term=strip_markers(term),      # el término va en limpio
                            definition=tidy(definition)))
    return entries


def read_album(path, carta_n):
    """
    Devuelve [{image, caption}] del ÁLBUM, extrayendo las imágenes
    embebidas del propio .docx a public/images/.
    """
    if not path:
        return []
    d = docx.Document(path)

    # imágenes embebidas, en orden de aparición
    blips = []
    for p in d.paragraphs:
        for b in p._p.findall('.//' + qn('a:blip')):
            rid = b.get(qn('r:embed'))
            if rid:
                blips.append((p, rid))

    items, seen = [], set()
    idx = 0
    pending_caption = None

    for p in d.paragraphs:
        txt = clean(p.text)
        has_img = bool(p._p.findall('.//' + qn('a:blip')))

        if has_img:
            for b in p._p.findall('.//' + qn('a:blip')):
                rid = b.get(qn('r:embed'))
                if not rid or rid in seen:
                    continue
                seen.add(rid)
                try:
                    part = d.part.related_parts[rid]
                except KeyError:
                    continue
                idx += 1
                ext = os.path.splitext(part.partname)[1] or '.jpg'
                name = f'album-c{carta_n:02d}-{idx:02d}{ext}'
                (IMG_OUT / name).write_bytes(part.blob)
                items.append(dict(image=f'/images/{name}',
                                  caption=pending_caption or ''))
                pending_caption = None
        elif txt and not re.match(r'^(MET|MO)\s*:', txt, re.I) \
                and not txt.isupper() and len(txt) > 12:
            # pie de foto candidato: se aplica a la imagen anterior o a la siguiente
            if items and not items[-1]['caption']:
                items[-1]['caption'] = txt
            else:
                pending_caption = txt
    return items


# ═══════════════════ lectura de los PDF ═══════════════════
def pdf_pages(pdf_name, first, last):
    """
    Para cada página del rango devuelve:
      body  → texto del cuerpo (columna izquierda)
      notes → números de nota impresos en la columna derecha
      title → título de sección si la página abre una nota completa
    """
    d = pymupdf.open(str(PDF_DIR / pdf_name))
    pages = []
    for pno in range(first - 1, min(last, len(d))):
        page = d[pno]
        pw = page.rect.width
        body, notes, title = [], set(), None
        for blk in page.get_text("dict")["blocks"]:
            if blk.get("type") != 0:
                continue
            margin = blk["bbox"][0] > pw * 0.63
            for ln in blk["lines"]:
                for sp in ln["spans"]:
                    f, s, t, fl = sp["font"], sp["size"], sp["text"], sp["flags"]
                    if 'Magister' in f and s > 13 and t.strip():
                        title = (title or '') + t
                    if margin:
                        if 'ACaslonPro' in f and (s <= 6.5 or abs(s - 9) < .2):
                            for num in re.findall(r'^\s*(\d+)', t):
                                notes.add(int(num))
                    else:
                        if 'ACaslonPro' in f and s >= 11 and not (fl & 1):
                            body.append(t)
        txt = clean(''.join(body)).replace('­ ', '').replace('­', '')
        pages.append(dict(body=txt, notes=notes, title=clean(title or '') or None))
    d.close()
    return pages


def pdf_notes_text(pdf_name, first, last):
    """
    Extrae las notas al margen del propio PDF (columna derecha).
    Solo se usa para las cartas que no tienen DOCX de notas.
    """
    d = pymupdf.open(str(PDF_DIR / pdf_name))
    chunks = []
    for pno in range(first - 1, min(last, len(d))):
        page = d[pno]
        pw = page.rect.width
        for blk in page.get_text("dict")["blocks"]:
            if blk.get("type") != 0 or blk["bbox"][0] <= pw * 0.63:
                continue
            txt = ''.join(sp["text"] for ln in blk["lines"] for sp in ln["spans"])
            txt = clean(txt).replace('­ ', '').replace('­', '')
            if txt:
                chunks.append(txt)
    d.close()

    notes, cur = {}, None
    for t in chunks:
        m = re.match(r'^(\d{1,2})\s+(.*)', t)
        if m and 1 <= int(m.group(1)) <= 99:
            cur = int(m.group(1))
            notes[cur] = m.group(2)
        elif cur is not None:
            notes[cur] += ' ' + t
    return {k: dict(text=clean(v), image=None, caption=None)
            for k, v in notes.items() if len(v) > 12}


def pdf_note_page(pdf_name, pno):
    """
    Contenido de una página de NOTA COMPLETA del impreso: la ilustración,
    su pie y el texto de la nota, que va a dos columnas centradas (no en
    la columna de notas al margen).

    Devuelve dict(image=Pixmap|None, caption=str, paragraphs=[str]).
    """
    d = pymupdf.open(str(PDF_DIR / pdf_name))
    page = d[pno]
    pw = page.rect.width

    # ── ilustración: la de mayor superficie ──
    big, area = None, 0
    for info_img in page.get_images(full=True):
        xref = info_img[0]
        try:
            pix = pymupdf.Pixmap(d, xref)
        except Exception:
            continue
        if pix.n > 4:
            pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
        if pix.width >= 200 and pix.width * pix.height > area:
            area, big = pix.width * pix.height, pix

    caption, cols = '', []
    for blk in page.get_text("dict")["blocks"]:
        if blk.get("type") != 0:
            continue
        x0, y0, x1, _ = blk["bbox"]
        sp0 = blk["lines"][0]["spans"][0]
        font, size = sp0["font"], sp0["size"]
        txt = clean(''.join(sp["text"] for ln in blk["lines"] for sp in ln["spans"]))
        txt = txt.replace('\u00ad ', '').replace('\u00ad', '')
        if not txt:
            continue
        if 'Magister' in font:               # título, cabecera y folio
            continue
        if 'SourceSansPro' in font or 'Komet' in font:
            caption = caption or txt
            continue
        if 'ACaslonPro' in font:
            cols.append(((x0 + x1) / 2, y0, txt))

    # orden de lectura: primero la columna izquierda, luego la derecha
    cols.sort(key=lambda c: (0 if c[0] < pw / 2 else 1, c[1]))
    paragraphs = [re.sub(r'^\d+\s*', '', t).strip() for _, _, t in cols]
    paragraphs = [t for t in paragraphs if len(t) > 30]

    d.close()
    return dict(image=big, caption=caption, paragraphs=paragraphs)


def pdf_printed_notes(pdf_name, first, last):
    """Números de nota que SÍ aparecen impresos (llamadas en el cuerpo)."""
    d = pymupdf.open(str(PDF_DIR / pdf_name))
    got = set()
    for pno in range(first - 1, min(last, len(d))):
        page = d[pno]
        pw = page.rect.width
        for blk in page.get_text("dict")["blocks"]:
            if blk.get("type") != 0 or blk["bbox"][0] > pw * 0.63:
                continue
            for ln in blk["lines"]:
                for sp in ln["spans"]:
                    if 'ACaslonPro' in sp["font"] and sp["size"] <= 7 and (sp["flags"] & 1):
                        t = sp["text"].strip()
                        if t.isdigit():
                            got.add(int(t))
    d.close()
    return got


# ═══════════════════ imágenes de la Selección ═══════════════════
def build_image_index(n):
    """{clave_normalizada: ruta} de todas las imágenes de la carta."""
    base = carta_dir(n)
    idx = {}
    if not base:
        return idx
    for f in glob.glob(base + '/**/*', recursive=True):
        if os.path.isfile(f) and f.lower().endswith(
                ('.jpg', '.jpeg', '.png', '.gif', '.tif', '.tiff')):
            idx[fold(Path(f).stem)] = f
    return idx


def resolve_image(ref, index, carta_n, caption=None, used=None):
    """Localiza el archivo de imagen que corresponde a una marca [Imagen: …]."""
    if not ref:
        return None
    k = fold(ref)
    if k in index:
        return index[k]
    for key, path in index.items():           # coincidencia por prefijo
        if len(k) >= 8 and (k[:14] in key or key[:14] in k):
            return path
    best, score = None, 0.0                    # coincidencia difusa por nombre
    for key, path in index.items():
        r = difflib.SequenceMatcher(None, k, key).ratio()
        if r > score:
            score, best = r, path
    if score > 0.55:
        return best

    # por palabras significativas del pie de foto
    if caption:
        words = [fold(w) for w in re.findall(r'[A-Za-zÁÉÍÓÚÑáéíóúñ]{4,}', caption)]
        for key, path in index.items():
            hits = sum(1 for w in words if w and w in key)
            if hits >= 2:
                return path

    # último recurso: si solo queda una imagen sin usar en la carta
    free = [p for kk, p in index.items() if p not in (used or set())]
    if len(free) == 1:
        return free[0]
    return None


def copy_image(src, carta_n, tag):
    if not src:
        return None
    ext = Path(src).suffix.lower()
    ext = '.jpg' if ext in ('.jpeg', '.jfif') else ext
    name = f'c{carta_n:02d}-{slug(tag)}{ext}'
    shutil.copy2(src, IMG_OUT / name)
    return f'/images/{name}'


# ═══════════════════ reconciliación PDF ↔ DOCX ═══════════════════
TOKEN_RE = re.compile(r'\[(fn|ht|em):([^\]]*)\]')


def tokenize(paras):
    """
    Convierte los párrafos en una lista plana de palabras anotadas:
      {word, wrap: None|'ht'|'em', fns: [n…], para: índice}
    Los marcadores se reparten por palabra para poder empalmar con el PDF
    sin perderlos.
    """
    words = []
    for pi, para in enumerate(paras):
        pos, wrap = 0, None
        for m in TOKEN_RE.finditer(para):
            for w in para[pos:m.start()].split():
                words.append(dict(word=w, wrap=None, fns=[], para=pi))
            kind, val = m.group(1), m.group(2)
            if kind == 'fn':
                if words and words[-1]['para'] == pi:
                    words[-1]['fns'].append(val)
                else:
                    words.append(dict(word='', wrap=None, fns=[val], para=pi))
            else:
                for w in val.split():
                    words.append(dict(word=w, wrap=kind, fns=[], para=pi))
            pos = m.end()
        for w in para[pos:].split():
            words.append(dict(word=w, wrap=None, fns=[], para=pi))
    return words


def detokenize(words, n_paras):
    """Reconstruye los párrafos a partir de la lista anotada."""
    buckets = [[] for _ in range(n_paras)]
    for w in words:
        buckets[min(w['para'], n_paras - 1)].append(w)

    out = []
    for bucket in buckets:
        parts, i = [], 0
        while i < len(bucket):
            w = bucket[i]
            if w['wrap']:
                group = [w['word']]
                fns = list(w['fns'])
                j = i + 1
                while j < len(bucket) and bucket[j]['wrap'] == w['wrap']:
                    group.append(bucket[j]['word'])
                    fns += bucket[j]['fns']
                    j += 1
                parts.append(f"[{w['wrap']}:{' '.join(group).strip()}]")
                parts += [f'[fn:{n}]' for n in fns]
                i = j
            else:
                if w['word']:
                    parts.append(w['word'])
                parts += [f'[fn:{n}]' for n in w['fns']]
                i += 1
        txt = ' '.join(parts)
        txt = re.sub(r'\s+(\[fn:)', r'\1', txt)
        txt = re.sub(r'\s+([,.;:!?»)])', r'\1', txt)
        txt = re.sub(r'([«(¿¡])\s+', r'\1', txt)
        out.append(clean(txt))
    return out


def apply_pdf_wording(doc_paras, pdf_text):
    """
    El PDF manda en la redacción. Aplica POSICIONALMENTE las variantes
    introducidas en la maquetación final, conservando los marcadores.

    Solo se aceptan cambios locales y seguros:
      · tramos de hasta 4 palabras a cada lado
      · se ignoran diferencias de solo acentos, mayúsculas o puntuación
      · se ignoran fragmentos que parecen ruido de extracción del PDF
    Devuelve (paragraphs, n_cambios, detalle).
    """
    if not pdf_text:
        return doc_paras, 0, []

    words = tokenize(doc_paras)
    doc_w = [w['word'] for w in words if w['word']]
    idx   = [k for k, w in enumerate(words) if w['word']]
    pdf_w = pdf_text.split()

    sm = difflib.SequenceMatcher(None, doc_w, pdf_w)
    if sm.ratio() < 0.70:                    # demasiado dispar: no tocar nada
        return doc_paras, 0, []

    def junk(seq):
        return any(len(t) <= 1 and t.isalpha() for t in seq)

    edits, changed, crossed = [], 0, []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag not in ('replace', 'delete'):
            continue
        if (i2 - i1) > 4 or (j2 - j1) > 4:
            continue
        src, dst = doc_w[i1:i2], pdf_w[j1:j2]
        if fold(' '.join(src)) == fold(' '.join(dst)):
            continue
        if junk(dst) or junk(src):           # «S eguro», guiones partidos…
            continue
        if tag == 'delete' and len(src) > 2:
            continue
        # No tocar cambios que cruzan un límite de párrafo: fusionarían
        # dos párrafos en uno. Se dejan para revisión manual.
        paras_touched = {words[k]['para'] for k in idx[i1:i2]}
        if len(paras_touched) > 1:
            crossed.append(' '.join(src))
            continue
        edits.append((i1, i2, dst, ' '.join(src)))

    for i1, i2, dst, src in reversed(edits):
        span = words[idx[i1]: idx[i2 - 1] + 1]
        para = span[0]['para']
        wrap = span[0]['wrap']
        fns  = [n for w in span for n in w['fns']]
        new  = [dict(word=w, wrap=wrap, fns=[], para=para) for w in dst]
        if new:
            new[-1]['fns'] = fns
        elif fns and span:
            new = [dict(word='', wrap=None, fns=fns, para=para)]
        words[idx[i1]: idx[i2 - 1] + 1] = new
        changed += 1

    detail = [(s, ' '.join(d)) for _, _, d, s in edits]
    detail += [(c, '⚠ cruza párrafos — revisar a mano') for c in crossed]
    return detokenize(words, len(doc_paras)), changed, detail


def paginate(paragraphs, pages):
    """
    Reparte los párrafos entre las páginas del PDF, calcando la
    maquetación impresa.

    Alinea el flujo de palabras del PDF con el del texto final mediante
    difflib (tolerante a las variantes de redacción), traduce el inicio
    de cada página del PDF a una posición del texto, y asigna cada
    párrafo a la página donde comienza.
    """
    plain = [strip_markers(p) for p in paragraphs]

    # palabras del texto final, con su párrafo
    doc_words, doc_para = [], []
    for pi, t in enumerate(plain):
        for w in t.split():
            doc_words.append(w)
            doc_para.append(pi)

    # palabras del PDF, anotando dónde empieza cada página
    pdf_words, page_start = [], []
    for pg in pages:
        page_start.append(len(pdf_words))
        pdf_words.extend(pg['body'].split())

    if not doc_words or not pdf_words:
        buckets = [[] for _ in pages]
        buckets[0] = list(paragraphs)
        return buckets

    # alineación PDF → texto final
    sm = difflib.SequenceMatcher(None, pdf_words, doc_words, autojunk=False)
    anchors = [(i, j) for i, j, n in sm.get_matching_blocks() if n for
               (i, j) in [(i, j)]]

    def pdf_to_doc(pi_idx):
        """Traduce un índice de palabra del PDF a índice en el texto final."""
        if not anchors:
            return 0
        best = anchors[0]
        for a in anchors:
            if a[0] <= pi_idx:
                best = a
            else:
                break
        return best[1] + (pi_idx - best[0])

    starts = [max(0, pdf_to_doc(s)) for s in page_start]
    # monótono creciente
    for k in range(1, len(starts)):
        starts[k] = max(starts[k], starts[k - 1])

    # primera palabra de cada párrafo
    first_word = {}
    for wi, pi in enumerate(doc_para):
        first_word.setdefault(pi, wi)

    buckets = [[] for _ in pages]
    for pi in range(len(paragraphs)):
        wi = first_word.get(pi, 0)
        page = 0
        for gi, st in enumerate(starts):
            if wi >= st:
                page = gi
        buckets[min(page, len(pages) - 1)].append(paragraphs[pi])
    return buckets


# ═══════════════════ emisión del archivo de datos ═══════════════════
def emit_carta(n, info, meta, buckets, pages, notes, printed, first_page):
    """Genera el contenido de src/data/.../spreads/carta-NN.js"""
    L = []
    A = L.append
    A(f"""/**
 * CARTA {info['num']} — «Noticias desde El Nilo»
 * Generado por scripts/build_book.py
 *
 * Texto: DOCX de Selección Cartas, con la redacción final del PDF aplicada.
 * Paginación: calcada del PDF ({info['pdf']}, págs. {info['pages'][0]}–{info['pages'][1]}).
 * Notas: todas las del aparato editorial. Las que no entraron en la
 *        maquetación impresa llevan inPrint: false.
 */

export const meta{n:02d} = {{
  id:         'carta-{n:02d}',
  number:     {esc(info['num'])},
  title:      {esc(meta.get('dedication') or info['to'])},
  place:      {esc(meta.get('place', ''))},
  firstPage:  {first_page},
}};
""")

    # ── notas ──
    A(f"export const footnotes{n:02d} = {{")
    for k in sorted(notes):
        nd = notes[k]
        flag = '' if k in printed else ', inPrint: false'
        img = f", image: {esc(nd['image'])}" if nd.get('image') else ''
        cap = f", caption: {esc(nd['caption'])}" if nd.get('caption') else ''
        A(f"  {k}: {{ text: {esc(nd['text'])}{img}{cap}{flag} }},")
    A("};\n")

    # ── spreads ──
    A(f"export const spreads{n:02d} = [")
    used_inline = set()
    i = 0
    while i < len(buckets):
        left_i, right_i = i, i + 1
        A("  {")
        for side, gi in (('left', left_i), ('right', right_i)):
            if gi is None or gi >= len(buckets):
                A(f"    {side}: {{ blocks: [] }},")
                continue
            pg = pages[gi]
            A(f"    {side}: {{")
            A(f"      pageNumber: '{first_page + gi}',")
            A("      blocks: [")
            if gi == 0:
                ded = meta.get('dedication') or info['to']
                loc = meta.get('place', '')
                A("        { type: 'chapter-header',")
                A(f"          title: {esc('CARTA ' + info['num'])},")
                A(f"          dedication: {esc(ded)},")
                A(f"          location: {esc(loc)} }},")
                for ref in re.findall(r'\[fn:(\d+)\]', ded + ' ' + loc):
                    nd = notes.get(int(ref))
                    if not nd or not nd.get('image') or int(ref) in used_inline:
                        continue
                    used_inline.add(int(ref))
                    title = clean(strip_markers(nd.get('caption') or nd['text']))
                    if len(title) > 78:
                        title = title[:75].rsplit(' ', 1)[0] + '…'
                    A("        { type: 'inline-note',")
                    A(f"          note: {ref},")
                    A(f"          title: {esc(title)},")
                    A(f"          image: {esc(nd['image'])},")
                    A(f"          caption: {esc(nd.get('caption') or '')} }},")
            elif pg.get('title') and buckets[gi]:
                # Si la página no lleva cuerpo es una nota completa y el
                # título lo pone ella misma: no se duplica aquí.
                A(f"        {{ type: 'section-title', text: {esc(pg['title'])} }},")

            # Página de NOTA COMPLETA del impreso: título propio, sin cuerpo
            if gi != 0 and pg.get('title') and not buckets[gi]:
                np = pdf_note_page(info['pdf'], info['pages'][0] - 1 + gi)
                img_src = None
                if np['image'] is not None:
                    name = f"c{n:02d}-completa-{gi+1:02d}.jpg"
                    try:
                        np['image'].save(str(IMG_OUT / name))
                        img_src = f'/images/{name}'
                    except Exception:
                        img_src = None
                A("        { type: 'full-note',")
                A(f"          title: {esc(pg['title'])},")
                A("          blocks: [")
                if img_src:
                    A(f"            {{ type: 'note-image', src: {esc(img_src)}, "
                      f"caption: {esc(np['caption'])} }},")
                for frag in np['paragraphs']:
                    A(f"            {{ type: 'note-paragraph', text: {esc(frag)} }},")
                A("          ] },")

            for k, para in enumerate(buckets[gi]):
                m = re.fullmatch(r'\[em:([^\]]+)\]((?:\[fn:\d+\])*)\.?', para.strip())
                if m and len(m.group(1)) < 120:
                    A(f"        {{ type: 'verse', text: {esc(m.group(1) + m.group(2))} }},")
                else:
                    drop = ', dropCap: true' if gi == 0 and k == 0 else ''
                    A(f"        {{ type: 'paragraph'{drop}, text: {esc(para)} }},")

                # Notas integradas: las notas con ilustración se abren
                # dentro de la página, tras el párrafo que las llama.
                for ref in re.findall(r'\[fn:(\d+)\]', para):
                    nd = notes.get(int(ref))
                    if not nd or not nd.get('image') or int(ref) in used_inline:
                        continue
                    used_inline.add(int(ref))
                    title = nd.get('caption') or nd['text']
                    title = clean(strip_markers(title))
                    if len(title) > 78:
                        title = title[:75].rsplit(' ', 1)[0] + '…'
                    A("        { type: 'inline-note',")
                    A(f"          note: {ref},")
                    A(f"          title: {esc(title)},")
                    A(f"          image: {esc(nd['image'])},")
                    A(f"          caption: {esc(nd.get('caption') or '')} }},")
            A("      ],")
            A("    },")
        A("  },")
        i += 2
    A("];\n")
    return '\n'.join(L)


# ═══════════════════════════ main ═══════════════════════════
def main():
    if not SEL_DIR:
        raise SystemExit('No encuentro la carpeta «Selección Cartas».')

    print('Construyendo «Noticias desde El Nilo»\n' + '─' * 64)
    letters, all_gloss, all_album, edit_log = [], [], [], []
    total_notes = total_print = 0

    for n, info in CARTAS.items():
        first, last = info['pages']
        pages   = pdf_pages(info['pdf'], first, last)
        pages   = [p for p in pages if p['body'] or p['title']] or pages
        printed = pdf_printed_notes(info['pdf'], first, last)
        index   = build_image_index(n)

        t_path = find_docx(n, 'TEXTO')
        n_path = find_docx(n, 'NOTAS')
        g_path = find_docx(n, 'GLOSARIO')
        a_path = find_docx(n, 'ALBUM')

        # ── texto ──
        if t_path:
            meta, paras = read_texto(t_path)
            pdf_all = clean(' '.join(p['body'] for p in pages))
            paras, nch, detail = apply_pdf_wording(paras, pdf_all)
            source = f'DOCX+PDF ({nch} ajustes)'
            edit_log.append((info['num'], detail))
        else:
            # carta sin DOCX (07): se extrae del PDF
            meta, paras, source = {}, [], 'solo PDF'
            for p in pages:
                if p['body']:
                    paras.extend([clean(x) for x in re.split(r'(?<=[.!?»])\s{2,}', p['body']) if x.strip()])
            if not paras:
                paras = [clean(' '.join(p['body'] for p in pages))]

        # ── notas ──
        notes = read_notas(n_path)
        if not notes:                       # sin DOCX: respaldo desde el PDF
            notes = pdf_notes_text(info['pdf'], first, last)
        used_files = set()
        for k, nd in notes.items():
            if nd.get('image'):
                src = resolve_image(nd['image'], index, n,
                                    caption=nd.get('caption'), used=used_files)
                if src:
                    used_files.add(src)
                nd['image'] = copy_image(src, n, f"nota-{k:02d}") if src else None
        total_notes += len(notes)
        total_print += len(printed)

        # ── glosario ──
        gl = read_glosario(g_path)
        if gl:
            all_gloss.append(dict(carta=info['num'], entries=gl))

        # ── álbum ──
        al = read_album(a_path, n)
        if al:
            all_album.append(dict(carta=info['num'], items=al))

        # ── paginar y emitir ──
        buckets = paginate(paras, pages)
        js = emit_carta(n, info, meta, buckets, pages, notes, printed, first)
        (SPREAD_OUT / f'carta-{n:02d}.js').write_text(js, encoding='utf-8')

        # El índice nombra siempre al destinatario («A la misma» no orienta)
        ded = strip_markers(meta.get('dedication') or '')
        if not ded or re.match(r'^A\s+(la|el)\s+mism[ao]', ded, re.I):
            ded = info['to']
        letters.append(dict(id=f'carta-{n:02d}', number=info['num'],
                            title=ded,
                            date=strip_markers(meta.get('place', '')),
                            spreads=(len(pages) + 1) // 2))

        print(f"Carta {info['num']:<4} {len(pages):2d} pág → {(len(pages)+1)//2:2d} spreads · "
              f"{len(paras):3d} párrafos · {len(notes):3d} notas "
              f"({len(printed)} impresas) · {len(gl):2d} glosario · "
              f"{len(al):2d} álbum · {source}")

    # ── glosario del libro ──
    g = ["/** GLOSARIO — «Noticias desde El Nilo» (por carta) */",
         "export const glossary = {", "  title: 'Glosario',", "  sections: ["]
    for sec in all_gloss:
        g.append(f"    {{ carta: {esc('Carta ' + sec['carta'])}, entries: [")
        for e in sec['entries']:
            g.append(f"      {{ term: {esc(e['term'])}, definition: {esc(e['definition'])} }},")
        g.append("    ] },")
    g += ["  ],", "};", "",
          "export const glossaryEntries = glossary.sections.flatMap(s =>",
          "  s.entries.map(e => ({ ...e, ref: s.carta })));", ""]
    (DATA_OUT / 'glossary.js').write_text('\n'.join(g), encoding='utf-8')

    # ── galería del libro ──
    a = ["/** GALERÍA — Álbum de Maxime Du Camp y láminas (por carta) */",
         "export const album = {", "  title: 'Galería de imágenes',", "  sections: ["]
    for sec in all_album:
        a.append(f"    {{ carta: {esc('Carta ' + sec['carta'])}, items: [")
        for it in sec['items']:
            a.append(f"      {{ image: {esc(it['image'])}, caption: {esc(it['caption'])} }},")
        a.append("    ] },")
    a += ["  ],", "};", "",
          "export const albumItems = album.sections.flatMap(s =>",
          "  s.items.map(i => ({ ...i, source: s.carta })));", ""]
    (DATA_OUT / 'album.js').write_text('\n'.join(a), encoding='utf-8')

    # ── meta del libro ──
    m = ["/** Metadatos del libro */", "export const meta = {",
         "  slug:   'flaubert-cartas',",
         "  title:  'Noticias desde El Nilo',",
         "  subtitle: 'Cartas de Egipto',",
         "  author: 'Gustave Flaubert',",
         "  imprint:'Ediciones Linotipo',",
         "  year:   '1849–1851',", "  lang:   'es',", "  letters: ["]
    for L in letters:
        m.append(f"    {{ id: {esc(L['id'])}, number: {esc(L['number'])}, "
                 f"title: {esc(L['title'])}, date: {esc(L['date'])}, spreads: {L['spreads']} }},")
    m += ["  ],", "};", ""]
    (DATA_OUT / 'meta.js').write_text('\n'.join(m), encoding='utf-8')

    ng = sum(len(s['entries']) for s in all_gloss)
    na = sum(len(s['items']) for s in all_album)
    print('─' * 64)
    print(f"TOTAL: {len(letters)} cartas · {total_notes} notas "
          f"({total_print} impresas, {total_notes-total_print} solo en digital) · "
          f"{ng} glosario · {na} álbum")
    print(f"Imágenes en {IMG_OUT}: {len(list(IMG_OUT.glob('*')))}")

    rep = ['# Ajustes de redacción aplicados desde el PDF final', '',
           'El texto base es el DOCX; estas variantes proceden de la maquetación',
           'impresa, que manda. Revisar editorialmente.', '']
    for num, detail in edit_log:
        if not detail:
            continue
        rep.append(f'## Carta {num}')
        for src, dst in detail:
            rep.append(f'- DOCX: «{src}»  →  PDF: «{dst}»')
        rep.append('')
    (PROJECT / 'REVISION_TEXTO.md').write_text('\n'.join(rep), encoding='utf-8')
    print('Informe de ajustes: REVISION_TEXTO.md')


if __name__ == '__main__':
    main()
