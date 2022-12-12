import React, { Component, CSSProperties } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { History } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import { Redirect, Route, Switch } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import { ThemeChooser } from 'react-bootswatch-theme-switcher';

// Static components
import { Error, Nav } from './components/static';

// Pages
import { MessageGenerator, SchemaGenerator } from './components/generate';
import Converter from './components/converter';
import Docs from './components/docs';
import Validator from './components/validator';

// Reducers & Actions
import { RootState } from './reducers';
import { UtilActions } from './actions';

// Interfaces
interface AppProps {
  history: History;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  siteTitle: state.Util.site_title,
  siteDesc: state.Util.site_desc
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  info: () => dispatch(UtilActions.info())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type AppConnectedProps = AppProps & ConnectorProps;

// Component
class App extends Component<AppConnectedProps> {
  meta = {
    title: 'JADN',
    description: 'JADN',
    canonical: `${window.location.origin}${window.location.pathname}`
  };

  themeOptionStyles: CSSProperties = {
    position: 'fixed',
    bottom: '5px',
    right: '5px'
  };

  constructor(props: AppConnectedProps) {
    super(props);
    const { info, siteDesc, siteTitle } = this.props;

    info().then(() => {
      this.meta = {
        ...this.meta,
        title: siteTitle,
        description: siteDesc
      };
      return this.meta;
    }).catch(_err => {});
  }

  render() {
    const { history } = this.props;
    return (
      <div className="container-fluid mt-3" >

        <Nav history={ history } />
        <ConnectedRouter history={ history }>
          <Switch>
            <Route exact path="/" component={ props => <Redirect to="/validate" { ...props } />  } />
            <Route exact path="/validate" component={ Validator } />
            <Route exact path="/convert" component={ Converter } />
            <Route exact path="/docs" component={ Docs } />
            <Route exact path="/generate" render={ props => <Redirect to="/generate/message" { ...props } /> } />
            <Route path="/generate/message" component={ MessageGenerator } />
            <Route path="/generate/schema" component={ SchemaGenerator } />
            {/* Error should always be last route */}
            <Route component={ Error } />
          </Switch>
        </ConnectedRouter>

        <div style={ this.themeOptionStyles }>
          <ThemeChooser size='sm' />
        </div>

        <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />
      </div>
    );
  }
}

export default connector(App);
