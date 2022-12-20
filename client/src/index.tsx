import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';


// Styles
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/assets/css/styles.scss';

// Application
import App from './app';

// Config
import configureStore, { history } from './store';
import { ThemeSwitcher } from 'react-bootswatch-theme-switcher';

const store = configureStore(history);

// Theme Options
const themeRoot = `${window.location.origin}/assets`;
const validThemes = ['superhero', 'darkly', 'sandstone'];

const Root = () => (
  <ThemeSwitcher storeThemeKey="theme" defaultTheme="darkly" themeRoot={ themeRoot } themeOptions={ validThemes }>
    <Provider store={ store } >
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Provider>
  </ThemeSwitcher>
);

const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);
root.render(<Root />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}