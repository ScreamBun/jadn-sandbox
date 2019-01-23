import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { ConnectedRouter } from 'connected-react-router'
import { Redirect, Router, Route, Switch } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';

import { ThemeChooser } from './components/utils'

import {
    Error,
    Nav
} from './components/static'

import CommandGenerator from './components/generate/command'
import Converter from './components/converter'
import Docs from './components/docs'
import SchemaGenerator from './components/generate/schema'
import Validator from './components/validator'

import * as UtilActions from './actions/util'

const str_fmt = require('string-format')

class App extends Component {
    constructor(props, context) {
        super(props, context)

        this.meta = {
            title: 'JADN',
            description: 'JADN',
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        this.themeOptionStyles = {
            position: 'fixed',
            bottom: 5+'px',
            right: 5+'px'
        }

        this.props.info().then(() => {
            this.meta = {
                ...this.meta,
                title: this.props.siteTitle,
                description: this.props.siteDesc,
            }
        })
    }

    render() {
        return (
            <div className="container-fluid mt-3" >
                <div className="ribbon ribbon-top-left">
	        		<span>Beta</span>
		        </div>

                <Nav history={ this.props.history } />

                <ConnectedRouter history={ this.props.history }>
                    <Switch>
                        <Route exact path="/" component={ props => <Redirect to="/validate" { ...props } />  } />
                        <Route exact path="/validate" component={ Validator } />
                        <Route exact path="/convert" component={ Converter } />
                        <Route exact path="/docs" component={ Docs } />
                        <Route exact path="/generate" render={ props => <Redirect to="/generate/message" { ...props } /> } />
                        <Route path="/generate/message" component={ CommandGenerator } />
                        <Route path="/generate/schema" component={ SchemaGenerator } />
                        <Route component={ Error } /> // This should always be last route
                    </Switch>
                </ConnectedRouter>

                <div style={ this.themeOptionStyles }>
                    <ThemeChooser size='sm' />
                </div>

                <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        siteTitle: state.Util.site_title,
        siteDesc: state.Util.site_desc
    }
}

function mapDispatchToProps(dispatch) {
    return {
        info: () => dispatch(UtilActions.info())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
