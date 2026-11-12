import { Brand, Footer } from './Chrome.jsx';
import { Rosette } from './Decor.jsx';

/** Место, которое должен заполнить владелец сервиса. */
export function Todo({ children }) {
  return <mark className="todo">[{children}]</mark>;
}

const num = (i) => String(i + 1).padStart(2, '0');

/** Раздел документа; номер и заголовок берутся из оглавления. */
export function makeSection(toc) {
  return function Section({ id, children }) {
    const index = toc.findIndex(([key]) => key === id);
    return (
      <section id={id} className="doc__sec" aria-labelledby={`${id}-h`}>
        <h3 id={`${id}-h`}>
          <span>{num(index)}</span>
          {toc[index][1]}
        </h3>
        {children}
      </section>
    );
  };
}

/** Общий каркас юридических страниц: закреплённая колонка с оглавлением + «документ». */
export function LegalLayout({ kicker, title, emphasis, toc, meta, docTitle, docSub, lede, draft = true, children }) {
  return (
    <div className="app app--legal">
      <header className="mbar">
        <div className="mbar__inner">
          <Brand />
          <a className="backlink" href="/">
            ← Zum Formular
          </a>
        </div>
      </header>

      <main className="layout">
        <aside className="aside">
          <Brand className="brand--aside" />
          <div className="hero hero--compact">
            <Rosette className="hero__rosette" />
            <p className="kicker">{kicker}</p>
            <h1>
              {title}
              <br />
              <em>{emphasis}</em>
            </h1>
          </div>
          <nav className="toc" aria-label="Inhalt">
            <ol>
              {toc.map(([id, label], i) => (
                <li key={id}>
                  <a href={`#${id}`}>
                    <span>{num(i)}</span>
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <a className="backlink backlink--aside" href="/">
            ← Zurück zum Formular
          </a>
        </aside>

        <div className="content">
          <p className="content__meta">{meta}</p>

          {draft && import.meta.env.DEV && (
            <p className="draft-note">
              Черновик (видно только в режиме разработки): заполните жёлтые места и перед запуском дайте текст на
              проверку юристу.
            </p>
          )}

          <article className="doc">
            <header className="doc__head">
              <h2>{docTitle}</h2>
              {docSub && <p>{docSub}</p>}
            </header>
            {lede && <p className="doc__lede">{lede}</p>}
            {children}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
