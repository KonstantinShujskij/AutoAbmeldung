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
import { IMPRESSUM_PATH, PRIVACY_PATH } from '../../shared/legal.js';
import App from './App.jsx';
import Impressum from './pages/Impressum.jsx';
import Privacy from './pages/Privacy.jsx';

// Несколько страниц — роутер не нужен. Vite и Express отдают index.html на любой путь.
const ROUTES = {
  [PRIVACY_PATH]: { Page: Privacy, title: 'Datenschutzhinweise · AutoFaren' },
  [IMPRESSUM_PATH]: { Page: Impressum, title: 'Impressum · AutoFaren' },
};
const route = ROUTES[window.location.pathname.replace(/\/+$/, '')];
const Page = route?.Page ?? App;
if (route) document.title = route.title;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
