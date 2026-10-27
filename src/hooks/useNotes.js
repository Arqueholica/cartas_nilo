/**
 * useNotes — notas del lector
 *
 * Ahora usa localStorage. Preparado para migrar a Supabase:
 * cuando llegue el momento, solo hay que cambiar las funciones
 * load/save para que hagan fetch a la API. La interfaz del hook
 * no cambia, y todos los componentes que lo usan seguirán funcionando.
 *
 * Interfaz pública:
 *   notes        → array de notas del spread actual
 *   addNote()    → añade una nota nueva con numeración romana
 *   updateNote() → actualiza el texto de una nota
 *   deleteNote() → elimina una nota
 *   toRoman()    → utilidad de numeración
 */
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'linotipo_reader_notes_v1';

function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let s = '';
  for (let i = 0; i < vals.length; i++) while (n >= vals[i]) { s += syms[i]; n -= vals[i]; }
  return s;
}

function loadAll() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

function saveAll(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useNotes(bookSlug, spreadIndex) {
  const storageKey = `${bookSlug}_s${spreadIndex}`;
  const [, forceRender] = useState(0);

  const getNotes = useCallback(() => {
    const all = loadAll();
    return all[storageKey] || [];
  }, [storageKey]);

  const addNote = useCallback(() => {
    const all   = loadAll();
    const notes = all[storageKey] || [];
    const now   = new Date();
    const ts    = now.toLocaleDateString('es-ES', { day:'2-digit', month:'short' })
                + ' ' + now.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
    notes.push({ id: Date.now(), text: '', time: ts });
    all[storageKey] = notes;
    saveAll(all);
    forceRender(n => n + 1);
    return notes.length; // índice de la nueva nota
  }, [storageKey]);

  const updateNote = useCallback((id, text) => {
    const all   = loadAll();
    const notes = all[storageKey] || [];
    const idx   = notes.findIndex(n => n.id === id);
    if (idx !== -1) { notes[idx].text = text; all[storageKey] = notes; saveAll(all); }
  }, [storageKey]);

  const deleteNote = useCallback((id) => {
    const all   = loadAll();
    const notes = (all[storageKey] || []).filter(n => n.id !== id);
    if (notes.length) all[storageKey] = notes; else delete all[storageKey];
    saveAll(all);
    forceRender(n => n + 1);
  }, [storageKey]);

  // Saber si un spread tiene notas (para el indicador en el sidebar)
  const hasNotesForSpread = useCallback((idx) => {
    const all = loadAll();
    const key = `${bookSlug}_s${idx}`;
    return !!(all[key] && all[key].length);
  }, [bookSlug]);

  return { notes: getNotes(), addNote, updateNote, deleteNote, toRoman, hasNotesForSpread };
}
