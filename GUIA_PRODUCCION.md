# Guía de producción de contenido multimedia
**Ediciones Linotipo — Lector interactivo**
*Para el equipo de producción de contenido*

---

## Estructura de carpetas de assets

```
public/assets/
├── images/          ← Imágenes estáticas y notas integradas
├── video/           ← Vídeos MP4
├── audio/           ← Audio MP3/OGG
├── models/          ← Objetos 3D (.glb)
├── animations/      ← Animaciones Lottie (.json)
├── panoramas/       ← Fotografías 360° (.jpg)
└── frames/          ← Secuencias de fotogramas individuales
```

**Convención de nombres:** `nombre-descriptivo-en-kebab-case.ext`
- ✓ `ceremonia-doseh-cairo.mp4`
- ✓ `canga-egipcia-siglo-xix.glb`
- ✗ `Video Final v3 BUENO.mp4`
- ✗ `modelo 3D canga (2).glb`

---

## Especificaciones por tipo de medio

---

### 🎬 VÍDEO

| Parámetro | Especificación |
|-----------|---------------|
| **Formato contenedor** | MP4 |
| **Codec de vídeo** | H.264 (AVC), perfil High, nivel 4.1 |
| **Codec de audio** | AAC, 128 kbps estéreo |
| **Resolución máxima** | 1920×1080 (Full HD) |
| **Resolución recomendada** | 1280×720 (HD) — mejor equilibrio calidad/peso |
| **Framerate** | 24 fps (estilo cinematográfico) o 25 fps (PAL) |
| **Bitrate de vídeo** | 2–5 Mbps para HD / 5–8 Mbps para Full HD |
| **Tamaño máximo** | 80 MB por clip |
| **Duración recomendada** | 30 segundos – 3 minutos |
| **Poster (miniatura)** | JPG 1280×720, mismo nombre que el vídeo |

**Subtítulos (opcional):**
Formato WebVTT (`.vtt`), UTF-8, mismo nombre que el vídeo:
```
00:00:03.000 --> 00:00:08.000
El Doseh era una ceremonia anual en El Cairo...
```

**Cómo exportar desde Premiere / DaVinci Resolve:**
- Formato: H.264 / MP4
- Perfil de codificación: High
- Velocidad de bits: VBR, 2 pasadas, objetivo 4 Mbps, máximo 6 Mbps

---

### 🔊 AUDIO

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | MP3 (compatibilidad universal) o OGG (mejor calidad/peso) |
| **Bitrate MP3** | 192 kbps estéreo / 128 kbps mono |
| **Frecuencia de muestreo** | 44.100 Hz |
| **Normalización** | −1 dBTP (true peak), −16 LUFS integrado |
| **Tamaño máximo** | 15 MB por pista |
| **Duración recomendada** | Hasta 5 minutos |

**Proporcionar siempre los dos formatos:**
```
musica-cairo-1850.mp3
musica-cairo-1850.ogg
```
El reproductor usará OGG si está disponible y MP3 como fallback.

**Herramientas recomendadas para conversión:** Audacity (gratuito), Adobe Audition

---

### 🗿 MODELOS 3D

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | glTF Binary (`.glb`) — un único archivo con todo incluido |
| **Tamaño máximo** | 15 MB (sin comprimir), 8 MB (recomendado) |
| **Polígonos** | Máximo 100.000 triángulos para mobile |
| **Texturas** | Incluidas en el .glb, máximo 2048×2048 px cada una |
| **Formato de texturas** | KTX2 + Basis Universal (compresión GPU) — exportar con `gltf-transform` |
| **Sistema de materiales** | PBR (Physically Based Rendering) — metallic/roughness |
| **Escala** | Metros como unidad base (1 unidad = 1 metro) |
| **Origen** | Centro geométrico del objeto |
| **Animaciones** | Soportadas (incluidas en el .glb) |

**Poster (preview mientras carga):**
JPG 800×800, render del modelo sobre fondo transparente o `var(--bg-page-alt)`.

**Herramientas para crear/exportar .glb:**
- Blender (gratuito): `File > Export > glTF 2.0`, marcar "Include > All Data"
- Sketchfab: exportar en formato glTF
- Adobe Substance 3D

**Optimización obligatoria antes de entregar:**
```bash
# Instalar gltf-transform una vez
npm install -g @gltf-transform/cli

# Optimizar el modelo
gltf-transform optimize modelo.glb modelo-opt.glb --texture-compress ktx2
```

**Verificar el modelo antes de entregarlo:**
https://modelviewer.dev/ — arrastrar el .glb para previsualizar exactamente como se verá.

---

### ✨ ANIMACIONES LOTTIE

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | JSON (Lottie) |
| **Tamaño máximo** | 500 KB |
| **Duración recomendada** | 2–15 segundos |
| **Imágenes externas** | NO — embeber todas las imágenes en el JSON |
| **Fuentes** | NO — convertir texto a contornos antes de exportar |
| **Framerate** | 25 fps |

**Cómo exportar desde After Effects:**
1. Instalar el plugin **Bodymovin** (gratuito, Adobe Exchange)
2. `Window > Extensions > Bodymovin`
3. Seleccionar la composición
4. Settings: "Include Glyphs" → NO, "Include Assets" → YES (embeber)
5. Exportar como JSON

**Alternativa sin After Effects:**
- **LottieFiles.com** — editor online con biblioteca de animaciones
- **Rive.app** — para animaciones más complejas e interactivas (exporta también a Lottie)

**Verificar antes de entregar:**
https://lottiefiles.com/preview — arrastrar el JSON para previsualizar.

---

### 🌐 PANORAMAS 360°

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | JPEG progresivo |
| **Proyección** | Equirrecangular (la estándar de todas las cámaras 360°) |
| **Resolución mínima** | 4096×2048 px |
| **Resolución óptima** | 8192×4096 px (para pantallas de alta densidad) |
| **Tamaño máximo** | 8 MB |
| **Calidad JPEG** | 85% |

**Cámaras 360° compatibles:**
Cualquier cámara que exporte equirrecangular: Ricoh Theta, GoPro Max, Insta360, Samsung Gear 360.

**Para panoramas de fotografías históricas o ilustraciones:**
Crear la imagen equirrecangular en Photoshop o Lightroom con el filtro de "Adaptive Wide Angle" o usar **PTGui** para unir múltiples fotos.

---

### 🎞 SECUENCIAS DE FOTOGRAMAS / GIFs

**Opción A — WebP animado (recomendada):**

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | WebP animado |
| **Resolución** | Máximo 1200px de ancho |
| **Fps** | 12–24 fps |
| **Tamaño máximo** | 3 MB |
| **Colores** | Sin límite (WebP es lossless o lossy) |

Convertir GIF a WebP animado:
```bash
# Con ffmpeg (instalar una vez)
ffmpeg -i animacion.gif -c:v libwebp -quality 80 animacion.webp
```

**Opción B — Frames individuales (para máxima calidad):**

| Parámetro | Especificación |
|-----------|---------------|
| **Formato** | JPEG (85%) o PNG (si hay transparencia) |
| **Nomenclatura** | `nombre-001.jpg`, `nombre-002.jpg`... (3 dígitos mínimo) |
| **Resolución** | Máximo 1200×800 px por frame |
| **Fps en el componente** | 12 fps por defecto, configurable |

---

## Cómo referenciar los assets en los datos

```javascript
// src/data/books/flaubert-cartas/spreads/carta-07.js

export const spreads = [
  {
    id: 1,
    left: { type: 'halftitle', bookTitle: 'Noticias desde El Nilo' },
    right: {
      pageNumber: '12–13',
      blocks: [
        // Párrafo normal
        {
          type: 'paragraph',
          text: 'Texto del párrafo con [fn:1] notas y [ht:términos] destacados.',
        },

        // Vídeo
        {
          type:    'video',
          src:     '/assets/video/ceremonia-doseh.mp4',
          poster:  '/assets/images/doseh-poster.jpg',
          caption: 'La ceremonia del Doseh en El Cairo, 1850.',
        },

        // Audio
        {
          type:    'audio',
          src:     '/assets/audio/musica-cairo-1850.mp3',
          title:   'Música callejera de El Cairo, siglo XIX',
          caption: 'Grabación etnomusicológica, Archivo CNRS, 1910.',
        },

        // Modelo 3D
        {
          type:       'model-3d',
          src:        '/assets/models/canga-egipcia.glb',
          poster:     '/assets/images/canga-poster.jpg',
          caption:    'Réplica digital de una canga del siglo XIX.',
          autoRotate: true,
          ar:         true,
        },

        // Animación Lottie
        {
          type:    'lottie',
          src:     '/assets/animations/ruta-nilo.json',
          caption: 'Ruta del viaje de Flaubert por el Nilo, 1849-1851.',
          autoplay: true,
          loop:    false,
        },

        // Panorama 360°
        {
          type:    'panorama',
          src:     '/assets/panoramas/piramides-giza.jpg',
          caption: 'Vista panorámica de las pirámides de Guiza.',
          pitch:   5,
          yaw:     180,
        },

        // Animación / GIF
        {
          type:    'image-sequence',
          src:     '/assets/animations/barco-nilo.webp',
          caption: 'El paso por las cataratas, reconstrucción animada.',
        },
      ],
    },
  },
];
```

---

## Lista de verificación antes de entregar assets

- [ ] Nombre de archivo en kebab-case, sin espacios ni caracteres especiales
- [ ] Peso dentro del límite especificado para cada tipo
- [ ] Formato correcto (H.264 para vídeo, .glb para 3D, etc.)
- [ ] Imagen poster/preview para vídeo y modelos 3D
- [ ] Previsualizado en el verificador correspondiente
- [ ] Depositado en la carpeta correcta de `public/assets/`
- [ ] Referenciado correctamente en el archivo `.js` del spread

---

## Herramientas gratuitas recomendadas

| Herramienta | Para qué | Link |
|-------------|---------|------|
| Handbrake | Comprimir vídeo | handbrake.fr |
| Audacity | Editar y exportar audio | audacityteam.org |
| Blender | Crear y exportar .glb | blender.org |
| LottieFiles | Crear y verificar animaciones | lottiefiles.com |
| Squoosh | Optimizar imágenes | squoosh.app |
| ffmpeg | Conversión de formatos (línea de comandos) | ffmpeg.org |
| ModelViewer | Verificar modelos 3D | modelviewer.dev |
