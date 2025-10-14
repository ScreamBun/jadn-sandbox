import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ThemeProvider } from '../src/components/static/ThemeProvider';

// Styles
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/assets/css/styles.scss';

// Application
import App from './app';

// Config
import configureStore, { history } from './store';
const store = configureStore(history);

const Root = () => (
  <ThemeProvider>
    <Provider store={store}>
      <HelmetProvider>
        <DndProvider backend={HTML5Backend}>
          <App history={history} />
        </DndProvider>
      </HelmetProvider>
    </Provider>
  </ThemeProvider>
);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
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