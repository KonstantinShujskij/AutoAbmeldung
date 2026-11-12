import { needsDisposal } from '../../../shared/validation.js';
import { FieldCell } from './FieldCell.jsx';

// Три варианта портала i-Kfz («Fahrzeugverbleib»).
const OPTIONS = [
  {
    id: 'abmelden',
    title: 'Nur abmelden',
    text: 'Das Fahrzeug bleibt erhalten und kann später wieder zugelassen werden – etwa bei Verkauf, Saisonpause oder Export.',
  },
  {
    id: 'verwertet',
    title: 'Verschrottet',
    text: 'Das Fahrzeug wurde in Deutschland oder der EU bei einem anerkannten Demontagebetrieb entsorgt. Sie haben den Verwertungsnachweis.',
  },
  {
    id: 'ausland',
    title: 'Entsorgung außerhalb der EU',
    text: 'Das Fahrzeug wurde nur zur Entsorgung in einen Staat außerhalb der EU bzw. des EWR gebracht.',
  },
];

/** Блок «Что будет с машиной» + данные об утилизации. Резервирование номера пока не предлагаем. */
export function Verbleib({ form, set, touch, errorFor, bind }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <fieldset className="verbleib">
      <legend className="verbleib__legend">Was passiert mit dem Fahrzeug?</legend>

      <div className="choices" role="radiogroup">
        {OPTIONS.map((o, i) => (
          <label key={o.id} className={`choice ${form.verbleib === o.id ? 'is-on' : ''}`}>
            <input
              type="radio"
              name="verbleib"
              value={o.id}
              className="choice__input"
              checked={form.verbleib === o.id}
              onChange={() => set('verbleib', o.id)}
              {...(i === 0 ? { 'data-field': 'verbleib' } : {})}
            />
            <span className="choice__dot" aria-hidden="true" />
            <span className="choice__title">{o.title}</span>
            <span className="choice__text">{o.text}</span>
          </label>
        ))}
      </div>
      {errorFor('verbleib') && <p className="zcell__error">{errorFor('verbleib')}</p>}

      {needsDisposal(form.verbleib) && (
        <div className="zgrid verbleib__grid">
          <FieldCell id="f-verwertungDatum" code="Datum" label="Datum der Verwertung" error={errorFor('verwertungDatum')} className="span-2">
            {(a) => <input {...a} {...bind('verwertungDatum')} type="date" max={today} className="zinput zinput--mono" />}
          </FieldCell>
          <FieldCell
            id="f-verwertungStaat"
            code="Staat"
            label="Staat der Verwertung"
            error={errorFor('verwertungStaat')}
            className={form.verbleib === 'verwertet' ? 'span-2' : 'span-4'}
          >
            {(a) => (
              <input
                {...a}
                {...bind('verwertungStaat')}
                placeholder={form.verbleib === 'verwertet' ? 'Deutschland' : 'z. B. Ukraine'}
                autoComplete="off"
                className="zinput"
              />
            )}
          </FieldCell>
          {form.verbleib === 'verwertet' && (
            <FieldCell
              id="f-demontageNr"
              code="Nr."
              label="Betriebsnummer des Demontagebetriebs"
              hint="Steht auf dem Verwertungsnachweis."
              error={errorFor('demontageNr')}
              className="span-2"
            >
              {(a) => (
                <input
                  {...a}
                  {...bind('demontageNr')}
                  onChange={(e) => set('demontageNr', e.target.value.toUpperCase())}
                  autoComplete="off"
                  spellCheck={false}
                  className="zinput zinput--mono"
                />
              )}
            </FieldCell>
          )}
        </div>
      )}
    </fieldset>
  );
}
