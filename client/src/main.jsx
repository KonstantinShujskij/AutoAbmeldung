import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Шрифты подключаем локально (без Google Fonts CDN — так проще с DSGVO).
import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';

import './styles/base.css';
import './styles/app.css';
import './styles/legal.css';
import { IMPRESSUM_PATH, PRIVACY_PATH, RATGEBER_PATH, KOSTEN_PATH, FAQ_PATH } from '../../shared/legal.js';
import App from './App.jsx';
import Impressum from './pages/Impressum.jsx';
import Privacy from './pages/Privacy.jsx';
import Ratgeber from './pages/Ratgeber.jsx';
import Kosten from './pages/Kosten.jsx';
import Faq from './pages/Faq.jsx';

// Несколько страниц — роутер не нужен. Vite и Express отдают index.html на любой путь.
const ROUTES = {
  [PRIVACY_PATH]: { Page: Privacy, title: 'Datenschutzhinweise · AutoAbmeldung' },
  [IMPRESSUM_PATH]: { Page: Impressum, title: 'Impressum · AutoAbmeldung' },
  [RATGEBER_PATH]: { Page: Ratgeber, title: 'Auto online abmelden – Anleitung · AutoAbmeldung' },
  [KOSTEN_PATH]: { Page: Kosten, title: 'Was kostet die Online-Abmeldung? · AutoAbmeldung' },
  [FAQ_PATH]: { Page: Faq, title: 'Häufige Fragen zur Auto-Abmeldung · AutoAbmeldung' },
};
const route = ROUTES[window.location.pathname.replace(/\/+$/, '')];
const Page = route?.Page ?? App;
if (route) document.title = route.title;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
