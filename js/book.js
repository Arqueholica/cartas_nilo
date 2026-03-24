/* ============================================
   CARTAS DEL NILO — CARTA VI  v3
   Two-page spread · Pull-tab notes · Reader notepad
   ============================================ */
(function () {
  'use strict';

  // ---- STATE ----
  let spread = 0;          // current spread index
  let flipping = false;
  let readerOpen = false;
  let tocOpen = false;
  let fontLvl = 2;
  const FONTS = [13, 14, 15, 16, 17, 19, 21];
  const FLIP = 900;
  let touchX = 0, touchY = 0;

  // ---- ROMAN NUMERALS ----
  function toRoman(n) {
    const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
    const rom  = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    let s = '';
    for (let i = 0; i < vals.length; i++) { while (n >= vals[i]) { s += rom[i]; n -= vals[i]; } }
    return s;
  }

  // ---- FOOTNOTES DATA ----
  const FN = {
    1: 'El Trópico de Cáncer, que se encuentra a 23°26\'14" de latitud al norte de la línea del Ecuador, es una línea paralela a éste que une los puntos del hemisferio norte donde los rayos del Sol caen verticalmente durante el solsticio del verano. La ciudad de Asuán está situada a 24°05\'20" de latitud norte.',
    2: 'En 1850, en Francia se utilizaba habitualmente la escala de Réaumur para la medición de la temperatura. Un grado Réaumur equivale a 1,25 grados Celsius. Así que Flaubert habla de una temperatura ambiente de 37,5 ºC.',
    3: 'El escritor Théophile Gautier (1811-1872) apadrinó literariamente al aspirante Flaubert durante su primera estancia en París en 1840.',
    4: 'El escultor Jean-Jacques Pradier (1790-1852), más conocido como James Pradier, y su esposa Louise entablaron amistad con el novelista en 1842.',
    5: 'Verso del Canto III del poema <em>Mélaenis</em>, que Bouilhet publicaría en 1851.',
    6: 'Región, ciudad y sultanato de Sennar, en Nubia, actual Sudán, a orillas del Nilo Azul.',
    7: 'La esclavitud se abolió oficialmente en Egipto en 1877, más de un cuarto de siglo después de la visita de Du Camp y Flaubert.',
    8: 'Flaubert brindaba a Bouilhet el trato de señor en su correspondencia.',
    9: 'Lago que desde el siglo XIX a. C., en el Imperio Medio egipcio, se extiende en la actual región de El Fayum. El viajante Heródoto (484-425 a. C.) lo visitó y le dio su nombre actual.',
    10: 'Capital de la región del Fayum, situada a 130 km al suroeste de El Cairo, y en la que se encuentra el lago Moeris.',
    11: 'Probablemente se refiere a un feligrés de la Iglesia Católica Maronita, fundada por san Marón (siglos IV-V) y que sobrevivió, refugiada en los montes del Líbano y Siria, a la expansión islámica.',
    12: 'El eremita san Antonio (251-356), el heresiarca Arrio (250-336) y san Atanasio (296-373) tienen en común que ejercieron su labor pastoral en tierras de Egipto. La figura de san Antonio tuvo gran influencia en Flaubert desde 1845, cuando contempló <em>Las tentaciones de san Antonio</em>, atribuida a Pieter Brueghel el Joven.',
    13: 'Población normanda situada en la orilla izquierda del último meandro del Sena antes de desembocar en su estuario, en El Havre.',
    14: 'La abadía de Graville, en El Havre, en Normandía, fundada en el siglo XIII, guarda las reliquias de santa Honorina, mártir (siglos III-IV).',
    15: 'En el Alto Egipto, en la gobernación de Mina, en la orilla oriental del Nilo, se divisa el Djebel El-Teir («la montaña de los pájaros»), en cuyas alturas se levanta un monasterio copto dedicado a la Virgen María.',
    16: 'Cristianos de Egipto y Etiopía, seguidores de las doctrinas monofisitas sobre la naturaleza de Cristo. La Iglesia copta surgió en el siglo V durante uno de los primeros cismas entre cristianos.',
    17: 'Flaubert confunde el nombre de la localidad con el del <em>santon</em>. Según Du Camp, el lugar es El-Shaikh Ebada, donde se encuentran las ruinas de la antigua Antinoópolis.',
    18: 'Pierre-Jean de Béranger (1780-1857) fue un poeta francés, autor de canciones populares. Flaubert lo consideraba un ejemplo de mediocridad literaria.',
    19: 'Algo más de 120 cm.',
    20: 'Serie de tres fotografías de Esna, la antigua Latopolis, tomadas por Du Camp en el viaje de vuelta a El Cairo.',
    21: 'El nombre de la cortesana significaba en turco «pequeña princesa» y «dama danzarina». Du Camp lo tradujo por «pequeña rosa». Antes de ser desterrada a Esna, fue amante de Abbas Pachá (1813-1854), nieto de Mehmet Alí.',
    22: 'Pinturas del francés Jean-Léon Gérôme (1824-1904), que retrató a varias almeas durante su viaje a Egipto en 1857, ilustran la indumentaria de Ruichuk-Hanem.',
    23: 'Alusión a una carta anterior en la que describe el baile de un <em>khawal</em> llamado Hassan El Bilbeis. Los <em>khawal</em> eran hombres travestidos que imitaban las danzas de las <em>ghawazi</em>, bailarinas ambulantes de origen gitano.',
    24: 'Se trata de Azizeh, descrita como «alta, delgada, negra o más bien verde, cabellos encrespados negros; sus ojos de estaño ruedan, de perfil es encantadora».',
    25: 'Nombre que recibieron los dominios de la actual Etiopía desde el siglo XIII hasta el final de la Segunda Guerra Mundial.',
    26: 'Probablemente Michel-Marie de Pomereu (1779-1863). El marquesado de Pomereu se remonta a 1717.',
    27: 'Municipio de Normandía, residencia de los Pomereu.',
    28: 'Este episodio dejó una profunda huella en el Flaubert adolescente, y su influencia se puede rastrear en el episodio de Vaubyessard, en <em>Madame Bovary</em>.',
    29: 'En sus notas de viaje, Flaubert registra que pasaron por Tebas el 4 de marzo. En el viaje de regreso permanecerán dos semanas en la región, visitando Karnak, Luxor, el Valle de los Reyes y Medinet Habu.',
    30: 'El 2 de abril la canga atracó en Hamameh, en la vertiente oriental del Nilo, frente a Dendera, en la orilla opuesta.',
    31: 'El símil de la guedeja de lana negra arrojada a la corriente de un molino no es una expresión usual en francés. Tal vez provenga de la observación directa de las fábricas textiles de Ruan.',
    32: 'Aunque Du Camp nació el 8 de febrero de 1822, dos meses después que él, al llamarlo «joven» Flaubert deja traslucir las tensiones que surgieron entre los dos amigos.',
    33: 'Con «pipa curada», Flaubert se refiere al procedimiento de quemar tabaco en la cazoleta de una pipa nueva para formar una capa de carbono que mejora la calidad del humo.',
    34: 'Canción de los pordioseros, compuesta por Béranger en 1812 y publicada en 1816 en su antología de <em>Chansons morales et autres</em>.'
  };

  // Map footnotes to spreads — each spread has [left-page-notes, right-page-notes]
  // Spread 0 = cover (no notes)
  // Spread 1 = page 1 (left) + page 2 (right)   ...etc
  const spreadFN = [
    [[], []],                   // 0: cover
    [[1, 2], [3, 4, 5]],       // 1: p1+p2
    [[6, 7, 8, 9], [10, 11, 12, 13, 14]], // 2: p3+p4
    [[15, 16, 17, 18], [19]],   // 3: p5+p6
    [[20, 21, 22, 23, 24], [25]], // 4: p7+p8
    [[26, 27, 28, 29, 30], [31]], // 5: p9+p10
    [[32, 33, 34], []]          // 6: p11+end
  ];

  const TOTAL = 7; // number of spreads

  // ---- DOM ----
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // ---- INIT ----
  function init() {
    updateUI();
    bindEvents();
    loadReaderNotes();
    renderReaderNotes();
  }

  // ---- NOTES PULL PANEL ----
  let notesOpen = false;
  let hlTimer = null;
  const notesTab  = $('#notesTab');
  const notesPull = $('#notesPull');
  const npScroll  = $('#npScroll');

  function renderNotes() {
    const [lNotes, rNotes] = spreadFN[spread] || [[], []];
    const allNotes = [...lNotes, ...rNotes];

    // Hide tab if no notes on this spread
    const zone = $('#notesZone');
    if (!allNotes.length) {
      zone.style.display = 'none';
      npScroll.innerHTML = '<p class="np-empty">Esta página no tiene notas.</p>';
      return;
    }
    zone.style.display = '';

    npScroll.innerHTML = allNotes.map((n, i) =>
      `<div class="np-item" data-n="${n}" style="animation-delay:${i * .06}s">
         <span class="np-num">${n}</span>
         <p class="np-text">${FN[n] || ''}</p>
       </div>`
    ).join('');
  }

  function openNotes() {
    notesOpen = true;
    notesPull.classList.add('open');
    notesTab.classList.add('open');
  }

  function closeNotes() {
    notesOpen = false;
    notesPull.classList.remove('open');
    notesTab.classList.remove('open');
    clearHL();
  }

  function toggleNotes() {
    notesOpen ? closeNotes() : openNotes();
  }

  function highlightNote(num) {
    // Open panel if needed
    if (!notesOpen) openNotes();
    clearHL();
    setTimeout(() => {
      const item = npScroll.querySelector(`.np-item[data-n="${num}"]`);
      if (!item) return;
      npScroll.classList.add('focusing');
      item.classList.add('hl');
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hlTimer = setTimeout(clearHL, 4000);
    }, notesOpen ? 50 : 420);
  }

  function clearHL() {
    clearTimeout(hlTimer);
    npScroll.classList.remove('focusing');
    npScroll.querySelectorAll('.np-item.hl').forEach(el => el.classList.remove('hl'));
  }

  // ---- NAVIGATION ----
  function goTo(idx) {
    if (flipping || idx === spread || idx < 0 || idx >= TOTAL) return;
    flipping = true;
    const dir = idx > spread ? 'fwd' : 'bwd';
    const curEl = $$('.spread')[spread];
    const nxtEl = $$('.spread')[idx];
    const flipLayer = $('#flipLayer');
    const codex = $('#codex');

    closeNotes();
    codex.classList.add('is-flipping');

    // Set flip face content hints
    const ff = flipLayer.querySelector('.flip-front');
    const fb = flipLayer.querySelector('.flip-back');
    ff.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-page').trim();
    fb.style.background = getComputedStyle(document.documentElement).getPropertyValue('--bg-page-left').trim();

    flipLayer.className = 'flip-layer ' + (dir === 'fwd' ? 'flipping' : 'flipping-back');

    setTimeout(() => {
      curEl.classList.remove('active');
      nxtEl.classList.add('active');
      flipLayer.className = 'flip-layer';
      codex.classList.remove('is-flipping');
      // Reset scroll
      nxtEl.querySelectorAll('.pg').forEach(p => p.scrollTop = 0);
      spread = idx;
      updateUI();
      flipping = false;
    }, FLIP);
  }

  function next() { goTo(spread + 1); }
  function prev() { goTo(spread - 1); }

  // ---- UI UPDATE ----
  function updateUI() {
    // Page indicator: show page numbers for spread
    const leftPg = spread === 0 ? '' : (spread * 2 - 1);
    const rightPg = spread === 0 ? '' : (spread * 2);
    const totalContentPages = (TOTAL - 1) * 2;
    if (spread === 0) {
      $('#pgInd').textContent = 'Portada';
    } else {
      $('#pgInd').textContent = `${leftPg}–${rightPg} / ${totalContentPages}`;
    }

    $('#navP').classList.toggle('off', spread === 0);
    $('#navN').classList.toggle('off', spread === TOTAL - 1);

    // Rebuild notes panel for current spread
    closeNotes();
    renderNotes();

    // TOC active
    $$('.toc-li').forEach(li => {
      li.classList.toggle('on', +li.dataset.sp === spread);
    });

    // Reader panel page label
    renderReaderNotes();
  }

  // ---- TOC ----
  function toggleToc() {
    tocOpen = !tocOpen;
    $('#tocSide').classList.toggle('open', tocOpen);
    $('#tocBg').classList.toggle('open', tocOpen);
  }
  function closeToc() {
    tocOpen = false;
    $('#tocSide').classList.remove('open');
    $('#tocBg').classList.remove('open');
  }

  // ---- READER NOTES ----
  const STORAGE_KEY = 'cartaVI_reader_notes';

  function loadReaderNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  }

  function saveReaderNotes(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }

  function getSpreadLabel() {
    if (spread === 0) return 'Portada';
    return `Páginas ${spread * 2 - 1}–${spread * 2}`;
  }

  function renderReaderNotes() {
    const body = $('#rpBody');
    if (!body) return;
    const all = loadReaderNotes();
    const key = 's' + spread;
    const notes = all[key] || [];

    let html = `<div class="rn-pg">${getSpreadLabel()}</div>`;
    notes.forEach((n, i) => {
      const rom = toRoman(i + 1);
      html += `<div class="rn-entry" data-i="${i}">
        <div class="rn-top">
          <span class="rn-num">${rom}</span>
          <span class="rn-time">${n.time}</span>
          <button class="rn-del" data-i="${i}" title="Eliminar">&times;</button>
        </div>
        <textarea class="rn-ta" data-i="${i}" rows="2">${escHtml(n.text)}</textarea>
      </div>`;
    });
    html += `<button class="rn-add" id="rnAdd">+ Añadir nota ${toRoman(notes.length + 1)}</button>`;
    body.innerHTML = html;

    // Bind
    body.querySelectorAll('.rn-ta').forEach(ta => {
      ta.addEventListener('input', () => {
        const idx = +ta.dataset.i;
        const d = loadReaderNotes();
        const k = 's' + spread;
        if (d[k] && d[k][idx]) { d[k][idx].text = ta.value; saveReaderNotes(d); }
      });
    });
    body.querySelectorAll('.rn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.i;
        const d = loadReaderNotes();
        const k = 's' + spread;
        if (d[k]) { d[k].splice(idx, 1); if (!d[k].length) delete d[k]; saveReaderNotes(d); renderReaderNotes(); }
      });
    });
    const addBtn = body.querySelector('#rnAdd');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const d = loadReaderNotes();
        const k = 's' + spread;
        if (!d[k]) d[k] = [];
        const now = new Date();
        const ts = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) +
                   ' ' + now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        d[k].push({ text: '', time: ts });
        saveReaderNotes(d);
        renderReaderNotes();
        // Focus new textarea
        setTimeout(() => {
          const tas = body.querySelectorAll('.rn-ta');
          if (tas.length) tas[tas.length - 1].focus();
        }, 60);
      });
    }

    // Update TOC pencil indicators
    updateTocPencils();
  }

  function updateTocPencils() {
    const all = loadReaderNotes();
    $$('.toc-li').forEach(li => {
      const sp = +li.dataset.sp;
      const key = 's' + sp;
      const pencil = li.querySelector('.toc-pencil');
      if (pencil) pencil.textContent = (all[key] && all[key].length) ? '✏️' : '';
    });
  }

  function toggleReader() {
    readerOpen = !readerOpen;
    $('#readerPanel').classList.toggle('open', readerOpen);
    $('#shell').classList.toggle('rp-open', readerOpen);
    $('#readerBtn').classList.toggle('on', readerOpen);
    if (readerOpen) renderReaderNotes();
  }
  function closeReader() {
    readerOpen = false;
    $('#readerPanel').classList.remove('open');
    $('#shell').classList.remove('rp-open');
    $('#readerBtn').classList.remove('on');
  }

  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ---- INLINE NOTES ----
  function setupInline() {
    $$('.inl-tog').forEach(b => b.addEventListener('click', () => b.closest('.inl').classList.toggle('open')));
  }

  // ---- LIGHTBOX ----
  function openLB(src, cap) {
    $('#lbImg').src = src; $('#lbImg').alt = cap || '';
    $('#lbCap').textContent = cap || '';
    $('#lb').classList.add('open');
  }
  function closeLB() { $('#lb').classList.remove('open'); }

  function setupLB() {
    $$('.inl-body .iw').forEach(w => {
      w.addEventListener('click', () => {
        const img = w.querySelector('img');
        const cap = w.closest('.inl-body').querySelector('.cap');
        openLB(img.src, cap ? cap.textContent : '');
      });
    });
    // Gallery images
    $$('.igal img').forEach(img => {
      img.addEventListener('click', e => {
        e.stopPropagation();
        openLB(img.src, img.alt);
      });
    });
    $('#lb').addEventListener('click', e => { if (e.target === $('#lb')) closeLB(); });
    $('#lbX').addEventListener('click', closeLB);
  }

  // ---- THEMES ----
  function setupThemes() {
    $$('.dot').forEach(d => {
      d.addEventListener('click', () => {
        document.body.dataset.theme = d.dataset.t;
        $$('.dot').forEach(x => x.classList.remove('on'));
        d.classList.add('on');
      });
    });
  }

  // ---- FONT SIZE ----
  function changeFont(d) {
    fontLvl = Math.max(0, Math.min(FONTS.length - 1, fontLvl + d));
    document.documentElement.style.setProperty('--font-size-base', FONTS[fontLvl] + 'px');
  }

  // ---- EVENTS ----
  function bindEvents() {
    $('#navP').addEventListener('click', prev);
    $('#navN').addEventListener('click', next);

    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'TEXTAREA') return; // don't intercept typing
      if (e.key === 'ArrowRight' || (e.key === ' ' && !e.shiftKey)) { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') { closeLB(); closeToc(); closeNotes(); }
    });

    // Touch
    const shell = $('#shell');
    shell.addEventListener('touchstart', e => {
      touchX = e.changedTouches[0].screenX;
      touchY = e.changedTouches[0].screenY;
    }, { passive: true });
    shell.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchX;
      const dy = e.changedTouches[0].screenY - touchY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) dx < 0 ? next() : prev();
    }, { passive: true });

    // TOC
    $('#tocBtn').addEventListener('click', toggleToc);
    $('#tocX').addEventListener('click', closeToc);
    $('#tocBg').addEventListener('click', closeToc);
    $$('.toc-li').forEach(li => {
      li.addEventListener('click', () => { goTo(+li.dataset.sp); closeToc(); });
    });

    // Footnote sup clicks → open notes panel and highlight
    $$('sup.fn').forEach(s => {
      s.addEventListener('click', e => {
        e.preventDefault();
        highlightNote(s.dataset.n);
      });
    });

    // Notes tab + panel
    notesTab.addEventListener('click', toggleNotes);
    $('#npX').addEventListener('click', closeNotes);
    npScroll.addEventListener('scroll', clearHL);

    // Close notes panel on click outside
    $('#codex').addEventListener('click', e => {
      if (notesOpen && !e.target.closest('.notes-pull') && !e.target.closest('.notes-tab') && !e.target.closest('sup.fn')) {
        closeNotes();
      }
    });

    // Reader
    $('#readerBtn').addEventListener('click', toggleReader);
    $('#rpX').addEventListener('click', closeReader);

    // Font
    $('#fontUp').addEventListener('click', () => changeFont(1));
    $('#fontDn').addEventListener('click', () => changeFont(-1));

    // Themes
    setupThemes();
    // Inline notes
    setupInline();
    // Lightbox
    setupLB();

    // Cover start
    const go = $('#startRead');
    if (go) go.addEventListener('click', () => goTo(1));

    // Auto-hide bar on scroll
    let barT;
    $$('.pg').forEach(p => {
      p.addEventListener('scroll', () => {
        $('#bar').classList.add('hide');
        clearTimeout(barT);
        barT = setTimeout(() => $('#bar').classList.remove('hide'), 1600);
      });
    });

    // Resize
    let rT;
    window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => {}, 200); });
  }

  // ---- BOOT ----
  document.addEventListener('DOMContentLoaded', init);
})();
