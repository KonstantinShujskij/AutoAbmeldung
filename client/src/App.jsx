import { useMemo, useState } from 'react';
import {
  CODE_RULES,
  EMPTY_FORM,
  FIELDS,
  SECTIONS,
  normalize,
  validateApplication,
} from '../../shared/validation.js';
import { PRIVACY_PATH } from '../../shared/legal.js';
import { Brand, Footer } from './components/Chrome.jsx';
import { CodeCard } from './components/CodeCard.jsx';
import { Confirmation } from './components/Confirmation.jsx';
import { Arrow, Check, Rosette } from './components/Decor.jsx';
import { FieldCell, VinRuler } from './components/FieldCell.jsx';
import { DocScan } from './components/DocScan.jsx';
import { PlateInput, PlateView } from './components/Plate.jsx';
import { MiniBar, Progress } from './components/Progress.jsx';
import { DEMO_FORM } from './demo.js';

const SECTION_META = {
  kontakt: { num: '01', title: 'Kontakt', short: 'E-Mail-Adresse' },
  halter: { num: '02', title: 'Halter', short: 'Name und Anschrift' },
  fahrzeug: { num: '03', title: 'Fahrzeug', short: 'FIN und Kennzeichen' },
  codes: { num: '04', title: 'Sicherheitscodes', short: 'Etiketten und Plaketten' },
};

const ALL_TOUCHED = Object.fromEntries(FIELDS.map((f) => [f, true]));

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  // Поля, подставленные с фото ZB II: имя → 'verified' | 'check'. Правка поля снимает отметку.
  const [fromScan, setFromScan] = useState({});

  const { errors } = useMemo(() => validateApplication(form), [form]);
  const openCount = Object.keys(errors).length;

  const set = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setServerErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
    setFromScan((m) => (m[name] ? { ...m, [name]: undefined } : m));
  };

  // Результат фото: заполняем только пустые поля (что клиент уже ввёл — не трогаем),
  // FIN — если поле пустое или с фото пришла подтверждённая.
  function applyScan({ vin, fields = {} }) {
    const updates = {};
    const marks = {};
    for (const [name, value] of Object.entries(fields)) {
      if (!form[name] && value) {
        updates[name] = value;
        marks[name] = 'check';
      }
    }
    if (vin?.value && (!form.vin || vin.status === 'verified')) {
      updates.vin = vin.value;
      marks.vin = vin.status;
    }
    const names = Object.keys(updates);
    if (names.length) {
      setForm((f) => ({ ...f, ...updates }));
      setFromScan((m) => ({ ...m, ...marks }));
      setTouched((t) => ({ ...t, ...Object.fromEntries(names.map((n) => [n, true])) }));
    }
    return names;
  }
  // Подпись под полем, заполненным с фото (без цветной подсветки — только текст).
  const scanHint = (name) =>
    fromScan[name] === 'verified'
      ? 'Aus dem Foto · per Prüfziffer bestätigt'
      : fromScan[name]
        ? 'Aus dem Foto übernommen – bitte prüfen'
        : undefined;
  const touch = (name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true }));
  const errorFor = (name) => serverErrors[name] || (touched[name] ? errors[name] : null);

  const bind = (name) => ({
    'data-field': name,
    name,
    value: form[name],
    onChange: (e) => set(name, e.target.value),
    onBlur: () => touch(name),
  });

  const sections = SECTIONS.map((s) => ({
    id: s.id,
    ...SECTION_META[s.id],
    done: s.fields.every((f) => !errors[f]),
  }));

  const jumpTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const focusFirstError = (errs) => {
    const first = FIELDS.find((f) => errs[f]);
    const el = first && document.querySelector(`[data-field="${first}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.focus({ preventScroll: true });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (sending) return;

    if (openCount > 0) {
      setTouched(ALL_TOUCHED);
      focusFirstError(errors);
      return;
    }

    setSending(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.errors) {
        setServerErrors(body.errors);
        setTouched(ALL_TOUCHED);
        focusFirstError(body.errors);
        return;
      }
      if (!res.ok) throw new Error(body.error || 'Senden fehlgeschlagen. Bitte erneut versuchen.');
      setResult({ ...body, values: normalize(form) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(
        err instanceof TypeError ? 'Keine Verbindung zum Server. Bitte später erneut versuchen.' : err.message,
      );
    } finally {
      setSending(false);
    }
  }

  const reset = () => {
    setForm(EMPTY_FORM);
    setTouched({});
    setServerErrors({});
    setFromScan({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const plateErrorName = ['plateDistrict', 'plateLetters', 'plateNumber'].find((f) => errorFor(f));
  const plateValues = { plateDistrict: form.plateDistrict, plateLetters: form.plateLetters, plateNumber: form.plateNumber };
  const plateView = {
    district: form.plateDistrict.toUpperCase(),
    letters: form.plateLetters.toUpperCase(),
    number: form.plateNumber.toUpperCase(),
  };
  const vinLength = form.vin.replace(/\s/g, '').length;

  const code = (name, props) => (
    <CodeCard
      id={`f-${name}`}
      name={name}
      length={CODE_RULES[name].length}
      optional={!CODE_RULES[name].required}
      value={form[name]}
      onChange={(v) => set(name, v)}
      onBlur={() => touch(name)}
      error={errorFor(name)}
      {...props}
    />
  );

  return (
    <div className="app">
      {/* Мобильная шапка: логотип и прогресс закреплены сверху */}
      <header className="mbar">
        <div className="mbar__inner">
          <Brand />
          {!result && <MiniBar items={sections} />}
        </div>
      </header>

      <main className="layout">
        {/* На десктопе колонка закреплена целиком, логотип в ней не двигается */}
        <aside className="aside">
          <Brand className="brand--aside" />
          <div className="hero">
            <Rosette className="hero__rosette" />
            <p className="kicker">Online-Abmeldung</p>
            <h1>
              Abmelden,
              <br />
              <em>ohne Amt.</em>
            </h1>
            <p className="lede">
              Vier Abschnitte, rund drei Minuten. Legen Sie beide Zulassungsbescheinigungen bereit und werfen Sie einen
              Blick auf die Kennzeichen.
            </p>
          </div>

          {!result && <Progress items={sections} onJump={jumpTo} />}

          <div className="aside__plate">
            <span className="aside__label">Ihr Kennzeichen</span>
            <PlateView {...(result ? {
              district: result.values.plateDistrict,
              letters: result.values.plateLetters,
              number: result.values.plateNumber,
            } : plateView)} rear size="md" />
          </div>
        </aside>

        <div className="content">
          <p className="content__meta">
            <span className="dot" /> i-Kfz · Außerbetriebsetzung
          </p>
          {result ? (
            <Confirmation result={result} onReset={reset} />
          ) : (
            <form className="sheets" onSubmit={handleSubmit} noValidate>
              <DocScan onResult={applyScan} />

              {/* 01 · Kontakt */}
              <section id="kontakt" className="sheet" style={{ '--i': 0 }} aria-labelledby="kontakt-title">
                <header className="sheet__head">
                  <span className="sheet__num">01</span>
                  <div>
                    <h2 id="kontakt-title" className="sheet__title">Kontakt</h2>
                    <p className="sheet__sub">Hierhin senden wir den amtlichen Bescheid als PDF und Ihre Rechnung.</p>
                  </div>
                </header>
                <div className="sheet__body">
                  <div className="zgrid">
                    <FieldCell id="f-email" code="@" label="E-Mail-Adresse" error={errorFor('email')}>
                      {(a) => (
                        <input
                          {...a}
                          {...bind('email')}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="name@beispiel.de"
                          className="zinput"
                        />
                      )}
                    </FieldCell>
                  </div>
                </div>
              </section>

              {/* 02 · Halter */}
              <section id="halter" className="sheet" style={{ '--i': 1 }} aria-labelledby="halter-title">
                <header className="sheet__head">
                  <span className="sheet__num">02</span>
                  <div>
                    <h2 id="halter-title" className="sheet__title">Halter</h2>
                    <p className="sheet__sub">
                      Aus der Zulassungsbescheinigung Teil II. Nehmen Sie die jüngste Spalte – dort steht der aktuelle
                      Halter.
                    </p>
                  </div>
                  <span className="sheet__doc">ZB II</span>
                </header>
                <div className="sheet__body">
                  <div className="zgrid">
                    <FieldCell id="f-lastName" code="C.3.1" label="Name oder Firmenname" error={errorFor('lastName')} hint={scanHint('lastName')} className="span-3">
                      {(a) => <input {...a} {...bind('lastName')} autoComplete="family-name" placeholder="Mustermann" className="zinput" />}
                    </FieldCell>
                    <FieldCell id="f-firstName" code="C.3.2" label="Vorname(n)" error={errorFor('firstName')} hint={scanHint('firstName')} className="span-3">
                      {(a) => <input {...a} {...bind('firstName')} autoComplete="given-name" placeholder="Erika" className="zinput" />}
                    </FieldCell>
                    <FieldCell id="f-street" code="C.3.3" label="Straße und Hausnummer" error={errorFor('street')} hint={scanHint('street')}>
                      {(a) => <input {...a} {...bind('street')} autoComplete="address-line1" placeholder="Musterstraße 12" className="zinput" />}
                    </FieldCell>
                    <FieldCell id="f-zip" code="C.3.3" label="PLZ" error={errorFor('zip')} hint={scanHint('zip')} className="span-2">
                      {(a) => (
                        <input
                          {...a}
                          {...bind('zip')}
                          onChange={(e) => set('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="44534"
                          className="zinput zinput--mono"
                        />
                      )}
                    </FieldCell>
                    <FieldCell id="f-city" code="C.3.3" label="Ort" error={errorFor('city')} hint={scanHint('city')} className="span-4">
                      {(a) => <input {...a} {...bind('city')} autoComplete="address-level2" placeholder="Lünen" className="zinput" />}
                    </FieldCell>
                  </div>
                </div>
              </section>

              {/* 03 · Fahrzeug */}
              <section id="fahrzeug" className="sheet" style={{ '--i': 2 }} aria-labelledby="fahrzeug-title">
                <header className="sheet__head">
                  <span className="sheet__num">03</span>
                  <div>
                    <h2 id="fahrzeug-title" className="sheet__title">Fahrzeug</h2>
                    <p className="sheet__sub">Die FIN steht in beiden Bescheinigungen im Feld E, das Kennzeichen im Feld A.</p>
                  </div>
                  <span className="sheet__doc">ZB I + II</span>
                </header>
                <div className="sheet__body">
                  <div className="zgrid">
                    <FieldCell
                      id="f-vin"
                      code="E"
                      label="Fahrzeug-Identifizierungsnummer (FIN)"
                      error={errorFor('vin')}
                      hint={scanHint('vin')}
                    >
                      {(a) => (
                        <>
                          <input
                            {...a}
                            {...bind('vin')}
                            onChange={(e) => set('vin', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 17))}
                            autoComplete="off"
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                            placeholder="WVWZZZ1JZ3W000001"
                            className="zinput zinput--mono zinput--vin"
                          />
                          <VinRuler length={vinLength} />
                        </>
                      )}
                    </FieldCell>
                    <FieldCell
                      id="f-plate"
                      code="A"
                      label="Amtliches Kennzeichen"
                      hint={scanHint('plateDistrict') ?? 'So wie auf dem Schild. Ein ganzes Kennzeichen lässt sich auch einfügen.'}
                      error={plateErrorName ? errorFor(plateErrorName) : null}
                      className="zcell--plate"
                    >
                      {(a) => (
                        <div className="plate-field">
                          <PlateInput
                            id={a.id}
                            values={plateValues}
                            onChange={set}
                            onBlur={touch}
                            invalid={Object.fromEntries(['plateDistrict', 'plateLetters', 'plateNumber'].map((f) => [f, !!errorFor(f)]))}
                            describedBy={a['aria-describedby']}
                          />
                        </div>
                      )}
                    </FieldCell>
                  </div>
                </div>
              </section>

              {/* 04 · Sicherheitscodes */}
              <section id="codes" className="sheet" style={{ '--i': 3 }} aria-labelledby="codes-title">
                <header className="sheet__head">
                  <span className="sheet__num">04</span>
                  <div>
                    <h2 id="codes-title" className="sheet__title">Sicherheitscodes</h2>
                    <p className="sheet__sub">
                      Groß- und Kleinschreibung zählt. <code className="glyph">0</code> und <code className="glyph">O</code>,{' '}
                      <code className="glyph">1</code>, <code className="glyph">l</code> und <code className="glyph">I</code> sind
                      verschiedene Zeichen.
                    </p>
                  </div>
                </header>
                <div className="sheet__body">
                  <div className="callout" role="note">
                    <span className="callout__icon" aria-hidden="true">!</span>
                    <p>
                      <strong>Erst freilegen, wenn Sie wirklich abmelden.</strong> Ein freigerubbeltes Etikett macht das
                      Dokument ungültig – die Plaketten auf den Schildern sind danach verbraucht.
                    </p>
                  </div>

                  <div className="codes">
                    {code('codeZb1', {
                      variant: 'zb',
                      title: 'Fahrzeugschein',
                      doc: 'Zulassungsbescheinigung Teil I',
                      where: 'Rückseite, grünes Etikett unten rechts – vorsichtig freirubbeln.',
                      wide: true,
                    })}
                    {code('codeFront', {
                      variant: 'plate',
                      title: 'Vorderes Kennzeichen',
                      doc: 'Stempelplakette vorne',
                      where: 'Unter der runden Plakette zwischen Ortskürzel und Buchstaben.',
                      plate: plateView,
                    })}
                    {code('codeBack', {
                      variant: 'plate',
                      title: 'Hinteres Kennzeichen',
                      doc: 'Stempelplakette hinten',
                      where: 'Unter der unteren Plakette, unterhalb der HU-Plakette.',
                      plate: plateView,
                      rear: true,
                    })}
                  </div>
                </div>
              </section>

              {/* Absenden */}
              <div className="submit">
                <div className={`consent ${errorFor('privacyAccepted') ? 'has-error' : ''}`}>
                  <input
                    id="f-privacy"
                    type="checkbox"
                    className="consent__input"
                    data-field="privacyAccepted"
                    checked={form.privacyAccepted}
                    onChange={(e) => {
                      set('privacyAccepted', e.target.checked);
                      touch('privacyAccepted');
                    }}
                    aria-invalid={errorFor('privacyAccepted') ? true : undefined}
                    aria-describedby={errorFor('privacyAccepted') ? 'f-privacy-msg' : undefined}
                  />
                  <span className="consent__box" aria-hidden="true">
                    <Check className="consent__check" />
                  </span>
                  <label htmlFor="f-privacy" className="consent__text">
                    Ich habe die{' '}
                    {/* В новой вкладке, чтобы не потерять заполненную форму */}
                    <a href={PRIVACY_PATH} target="_blank" rel="noopener">
                      Datenschutzhinweise
                    </a>{' '}
                    gelesen und zur Kenntnis genommen, dass meine Angaben zur Durchführung der Abmeldung verarbeitet und an
                    die zuständige Zulassungsbehörde übermittelt werden.
                  </label>
                  {errorFor('privacyAccepted') && (
                    <p id="f-privacy-msg" className="consent__error">
                      {errorFor('privacyAccepted')}
                    </p>
                  )}
                </div>

                <div className="submit__text">
                  <strong>{openCount === 0 ? 'Alles bereit.' : `Noch ${openCount} ${openCount === 1 ? 'Angabe' : 'Angaben'} offen.`}</strong>
                  <span>Wir prüfen alles, bevor etwas an die Behörde geht. Bezahlt wird erst im nächsten Schritt.</span>
                  {submitError && (
                    <span className="submit__error" role="alert">
                      {submitError}
                    </span>
                  )}
                </div>
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Wird gesendet …' : 'Angaben absenden'}
                  <Arrow className="btn-primary__arrow" />
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer newTab={!result} />

      {import.meta.env.DEV && !result && (
        <button type="button" className="devfill" onClick={() => setForm({ ...EMPTY_FORM, ...DEMO_FORM })}>
          Testdaten
        </button>
      )}
    </div>
  );
}
