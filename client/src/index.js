import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import registerServiceWorker from './registerServiceWorker'

// Styles
import { ThemeSwitcher } from './components/utils'
import 'bootstrap'
import 'react-toastify/dist/ReactToastify.css';
// import './components/dependencies/css/themes/sandstone.css'
import './components/dependencies/css/styles.less'

import App from './app'

// Config
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'

const history = createHistory()
const store = configureStore(history)

// Them Options
const validThemes = ['cyborg', 'darkly', 'sandstone', 'slate']

const Root = () => (
    <Provider store={ store } >
        <ThemeSwitcher storeThemeKey="theme" defaultTheme="sandstone" themeOptions={ validThemes }>
            <App history={ history } />
        </ThemeSwitcher>
    </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'));

registerServiceWorker();
