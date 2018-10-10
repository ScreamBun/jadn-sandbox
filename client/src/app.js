import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

import { ConnectedRouter } from 'react-router-redux'
import { Router, Route, Switch } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';

import { Error, Home, Nav } from './components/static'

// import CMD_Gen from './components/cmd_gen'
import Converter from './components/converter'
import Validator from './components/validator'

import * as UtilActions from './actions/util'

class App extends Component {
    constructor(props, context) {
        super(props, context)
        // this.props.info()
    }

    render() {
        return (
            <div className="container-fluid mt-3" >
                <Nav history={ this.props.history } />

                <ConnectedRouter history={ this.props.history }>
                    <Switch>
                        <Route exact path="/" component={ Validator } />
                        <Route exact path="/convert" component={ Converter } />
                        {/*
                        <Route path="/create/" component={ CMD_Gen } />
                        */}
                        <Route component={ Error } /> // This should always be last route
                    </Switch>
                </ConnectedRouter>

                <ToastContainer position={ toast.POSITION.BOTTOM_CENTER } autoClose={ 5000 } />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return {
        info: () => dispatch(UtilActions.info())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
