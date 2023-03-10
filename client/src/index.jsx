import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeSwitcher } from 'react-bootswatch-theme-switcher';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/assets/css/styles.scss';

// Application
import App from './app';

// Config
import configureStore, { history } from './store';

const store = configureStore(history);

// Theme Options
const themeRoot = `${window.location.origin}/assets`;
const validThemes = ['dark', 'light'];

const Root = () => (
  <ThemeSwitcher storeThemeKey="theme" defaultTheme="dark" themeRoot={ themeRoot } themeOptions={ validThemes }>
    <Provider store={ store } >
      <HelmetProvider>
        <App history={ history } />
      </HelmetProvider>
    </Provider>
  </ThemeSwitcher>
);

ReactDOM.createRoot(document.getElementById('root')).
render(
  // <React.StrictMode>
    <Root />
  // </React.StrictMode>
);

// TODO: Include a service worker
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/service-worker.js");
//   });
// }