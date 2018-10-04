import React from 'react'
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux'
import registerServiceWorker from './registerServiceWorker'

console.log('App State: ' + process.env.NODE_ENV)

// Styles
import 'bootstrap'
import 'react-toastify/dist/ReactToastify.css';
import './components/dependencies/css/themes/sandstone.css'
import './components/dependencies/css/styles.less'


import App from './app'

// Config
import createHistory from 'history/createBrowserHistory'
import configureStore from './store'

const history = createHistory()
const store = configureStore(history)


const Root = () => (
    <Provider store={ store } >
        <App history={ history } />
    </Provider>
)

ReactDOM.render(<Root />, document.getElementById('root'));

registerServiceWorker();
