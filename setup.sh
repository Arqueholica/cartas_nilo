#!/usr/bin/env bash
# Prepara el entorno del proyecto desde cero.
# Útil tras clonar o cuando el contenedor de trabajo se reinicia.
set -e

echo "→ Dependencias de Node"
npm install

echo "→ Dependencias de Python (solo para scripts/build_book.py)"
pip install --quiet --break-system-packages pymupdf python-docx

cat <<'TXT'

Listo.
  npm run dev      servidor de desarrollo
  npm run build    compilar para producción

Para regenerar los datos desde los materiales editoriales hace falta,
además, el material de origen (PDFs + «Selección Cartas»), que no se
versiona aquí por tamaño:

  LINOTIPO_SRC=/ruta/a/los/materiales python3 scripts/build_book.py

TXT
