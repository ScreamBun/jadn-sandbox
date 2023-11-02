# JADN Sandbox - Client/GUI

## Notes

- React based single page application
- To update dependencies, install the yarn upgrade-interactive, then following its onscreen instructions.  
  - It is preferred to start with the min upgrades, then test the app.  
  - Major upgrades should be researched and tested one at a time.
  - After install, to run enter this in a command window under the client:
    - yarn upgrade-interactive

## Resources

- General Elements
  - [API Buffer](https://www.npmjs.com/package/buffer) - Assists with API calls
  - [Charts](https://www.npmjs.com/package/react-chartjs-2) - UI Charts and Graphs
    - [Charts](https://www.npmjs.com/package/chart.js) - Needed with React Charts
  - [Data Beautifier](https://www.npmjs.com/package/vkbeautify) - JSON, XML, CSS, SQL pretty/minify
  - [Fast Deep Equal](https://www.npmjs.com/package/fast-deep-equal) - Checks equality of Date and RegExp objects by value
  - [File Saver](https://www.npmjs.com/package/file-saver) - File loader  
  - [Font Awesome](https://fontawesome.com/)
    - [Core SVG Icons](https://www.npmjs.com/package/@fortawesome/fontawesome-svg-core)
    - [Solid SVG Icons](https://www.npmjs.com/package/@fortawesome/free-solid-svg-icons)
    - [React FontAwesome](https://www.npmjs.com/package/@fortawesome/react-fontawesome)  
  - [History](https://www.npmjs.com/package/history) - History management for single page apps
  - [HTML Parser](https://www.npmjs.com/package/html-react-parser) - HTML string to React
  - [Lodash](https://www.npmjs.com/package/lodash) - JSON and String parsing and querying utility
  - [React](https://reactjs.org/) - Core Framework
    - [Redux Binding](https://www.npmjs.com/package/connected-react-router) - Synchronize router state with redux store
    - [DOM](https://www.npmjs.com/package/react-dom) - Entry point to the DOM for React
    - [Drag and Drop](https://www.npmjs.com/package/react-dnd) - UI Drag and drop
    - [HTML Header](https://www.npmjs.com/package/react-helmet-async) - HTML Header Helper
    - [JSON Editor](https://www.npmjs.com/package/react-json-editor-ajrm) - JSON Syntax Editor
    - [JSON Pretty](https://www.npmjs.com/package/react-json-pretty) - Pretty Prints JSON
    - [New Window](https://www.npmjs.com/package/react-popout) - Popup Windows
    - [Redux](https://www.npmjs.com/package/react-redux) - React Redux Bindings
    - [Router](https://www.npmjs.com/package/react-router-dom) - App navigation
    - [React Toastify](https://www.npmjs.com/package/react-toastify) - Popup Notifications
  - [State Storage](https://redux.js.org/) - State container
    - [redux-api-middleware](https://www.npmjs.com/package/redux-api-middleware) - Provides the ability to call API endpoints
    - [redux-logger](https://www.npmjs.com/package/redux-logger) - Provides redux storage logging
    - [redux-persist](https://www.npmjs.com/package/redux-persist) - Interacts with the Redux Store
    - [redux-thunk](https://www.npmjs.com/package/redux-thunk) - Interacts with the Redux Store
  - [UUID](https://www.npmjs.com/package/uuid) - Simple UUID creation

- Developement
  - [WebPack](https://www.npmjs.com/package/webpack) - Module bundler and builder
    - [Plugins](https://webpack.js.org/plugins) - Plugin Info
      - [Clean](https://www.npmjs.com/package/clean-webpack-plugin)
      - [Copy](https://www.npmjs.com/package/copy-webpack-plugin)
      - [HTML](https://www.npmjs.com/package/html-webpack-plugin)
      - [Mini CSS](https://www.npmjs.com/package/mini-css-extract-plugin)
      - [Terser](https://www.npmjs.com/package/terser-webpack-plugin)
      - [Bundle Tracker](https://www.npmjs.com/package/webpack-bundle-tracker)
    - [Loaders](https://webpack.js.org/loaders) - Loader Info
      - [Babel](https://www.npmjs.com/package/babel-loader)
        - [Babel Core](https://www.npmjs.com/package/@babel/core)
        - [Proposal Object Rest Spread](https://www.npmjs.com/package/@babel/plugin-proposal-object-rest-spread)
        - [Preset Env](https://www.npmjs.com/package/@babel/preset-env)
        - [Preset React](https://www.npmjs.com/package/@babel/preset-react)
      - [CSS](https://www.npmjs.com/package/css-loader)
      - [File](https://www.npmjs.com/package/file-loader)
      - [Less](https://www.npmjs.com/package/less-loader) - Loads Less to CSS
        - [Less](https://www.npmjs.com/package/less) - Core package
      - [Style](https://www.npmjs.com/package/style-loader)
    - [WebPack CLI](https://www.npmjs.com/package/webpack-cli)
    - [WebPack Dev Server](https://www.npmjs.com/package/webpack-dev-server)
    - [WebPack Merge](https://www.npmjs.com/package/webpack-merge)
