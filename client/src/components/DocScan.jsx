import { useEffect, useRef, useState } from 'react';

const MAX_SIDE = 2600;

/** Фото → JPEG ≤ 2600 px по длинной стороне (EXIF-поворот применяет сам браузер). */
async function prepare(file) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/jpeg', 0.9),
    );
  } catch {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
    throw new Error('Dieses Bildformat können wir nicht lesen. Bitte ein JPEG- oder PNG-Foto wählen.');
  }
}

const LABELS = {
  lastName: 'Name',
  firstName: 'Vorname',
  street: 'Straße',
  zip: 'PLZ',
  city: 'Ort',
  plateDistrict: 'Kennzeichen',
};

/**
 * Карточка «Фото ZB II»: читает FIN, владельца и номер и отдаёт их форме.
 * onResult({ vin: {value, status}, fields }) — форма сама решает, что подставить.
 */
export function DocScan({ onResult }) {
  const [state, setState] = useState({ phase: 'idle' });
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  async function handleFile(file) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setState({ phase: 'busy' });
    try {
      const blob = await prepare(file);
      const res = await fetch('/api/recognize', {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'image/jpeg' },
        body: blob,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Das Foto konnte nicht gelesen werden.');
      const applied = onResult(data);
      setState({ phase: 'done', vin: data.vin, applied, documentType: data.documentType });
    } catch (err) {
      setState({ phase: 'error', message: err.message || 'Verbindung fehlgeschlagen. Bitte erneut versuchen.' });
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  const pick = () => inputRef.current?.click();
  const { phase } = state;

  return (
    <section className={`scan scan--${phase}`} aria-live="polite" style={{ '--i': 0 }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="scan__file"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="scan__thumb" aria-hidden="true">
        {preview ? <img src={preview} alt="" /> : <DocGlyph />}
        {phase === 'busy' && <span className="scan__beam" />}
      </div>

      <div className="scan__body">
        {phase === 'idle' && (
          <>
            <p className="scan__kicker">Schneller mit Foto</p>
            <h2 className="scan__title">Fahrzeugbrief fotografieren</h2>
            <p className="scan__text">
              Ein Foto der Zulassungsbescheinigung <strong>Teil II</strong> genügt: Wir lesen FIN, Halter und
              Kennzeichen aus – Sie prüfen nur noch. Die Sicherheitscodes tragen Sie selbst ein.
            </p>
            <button type="button" className="scan__btn" onClick={pick}>
              <CameraGlyph /> Foto aufnehmen oder wählen
            </button>
          </>
        )}

        {phase === 'busy' && (
          <>
            <p className="scan__kicker">Wird gelesen …</p>
            <h2 className="scan__title">Einen Moment</h2>
            <p className="scan__text">Wir lesen die Felder E, A und C aus. Das dauert etwa 5–15 Sekunden.</p>
          </>
        )}

        {phase === 'done' && <ScanSummary state={state} onRetry={pick} />}

        {phase === 'error' && (
          <>
            <p className="scan__kicker scan__kicker--warn">Nicht gelesen</p>
            <h2 className="scan__title">Das hat nicht geklappt</h2>
            <p className="scan__text">{state.message}</p>
            <button type="button" className="scan__btn" onClick={pick}>
              <CameraGlyph /> Noch einmal versuchen
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ScanSummary({ state, onRetry }) {
  const { vin, applied } = state;
  const filled = applied.filter((f) => LABELS[f]).map((f) => LABELS[f]);
  const nothing = vin.status === 'not_found' && filled.length === 0;
  return (
    <>
      <p className={`scan__kicker ${nothing ? 'scan__kicker--warn' : ''}`}>
        {nothing ? 'Nichts erkannt' : 'Übernommen – bitte prüfen'}
      </p>
      <h2 className="scan__title">
        {nothing ? 'Kein Fahrzeugbrief erkannt' : vin.status === 'verified' ? 'FIN bestätigt' : 'Bitte vergleichen'}
      </h2>
      <ul className="scan__list">
        <li className={`is-${vin.status}`}>
          <span>FIN</span>
          {vin.status === 'verified' && 'gelesen und per Prüfziffer bestätigt'}
          {vin.status === 'check' && 'gelesen – bitte Zeichen für Zeichen mit Feld E vergleichen'}
          {vin.status === 'not_found' && 'nicht lesbar – bitte von Hand eintragen'}
        </li>
        <li className={filled.length ? 'is-check' : 'is-not_found'}>
          <span>Halter</span>
          {filled.length ? `${filled.join(', ')} übernommen` : 'nicht sicher lesbar – bitte von Hand eintragen'}
        </li>
      </ul>
      <button type="button" className="scan__btn scan__btn--ghost" onClick={onRetry}>
        Anderes Foto
      </button>
    </>
  );
}

function DocGlyph() {
  return (
    <svg viewBox="0 0 64 80" className="scan__glyph">
      <rect x="4" y="4" width="56" height="72" rx="4" />
      <path d="M12 16h28M12 24h40M12 32h18M34 32h18M12 40h18M34 40h18M12 52h40M12 60h40M12 68h24" />
    </svg>
  );
}

function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="scan__cam" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
