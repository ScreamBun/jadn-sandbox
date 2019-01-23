import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'

import { jadn_api } from './jadn_api'

import {
    under_escape,
    Card_Template,
    Constructor_Template,
    Enum_Template,
    Function_Template,
    Toggle_Template,
} from './templates'

const str_fmt = require('string-format')

class Converter extends Component {
    constructor(props, context) {
        super(props, context)

        this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'API Docs'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }
    }

    body_format(body) {
        return Object.keys(body).map((n, i) => {
            let data = body[n]
            // console.log(data)

            let data_constructor = data.hasOwnProperty('constructor') ? <Constructor_Template { ...data.constructor } /> : ''
            let data_enum = data.hasOwnProperty('enum') ? <Enum_Template en={ data.enum } /> : ''
            let data_function = data.hasOwnProperty('function') ? <Function_Template fun={ data.function } /> : ''

            const tmp_data = {
                ...data,
                body: (
                    <div className="m-0 p-0 w-100">
                        { data_constructor }
                        { data_enum }
                        { data_function }
                    </div>
                )
            }

            return <Card_Template key={ i } { ...tmp_data } />
        })
    }

    pkg_format(pkg, i) {
        let body_pkg = ''
        let body_enum = ''
        let body_class = ''
        let body_function = ''

        if (pkg.hasOwnProperty('body')) {
            if (pkg.body.hasOwnProperty('package')) {
                body_pkg = Object.keys(pkg.body.package).map((n, j) => {
                    let data = pkg.body.package[n]
                    data.header = n
                    return this.pkg_format(data, j)
                })
            }

            if (pkg.body.hasOwnProperty('enum')) {
                body_enum = this.body_format(pkg.body.enum)
            }

            if (pkg.body.hasOwnProperty('class')) {
                body_class = this.body_format(pkg.body.class)
            }

            if (pkg.body.hasOwnProperty('function')) {
                body_function = <Function_Template fun={ pkg.body.function } />
            }
        }

        const tmp_pkg = {
            ...pkg,
            header: <Toggle_Template header={ pkg.header } />,
            body: (
                <div id={ under_escape(pkg.header) + '-api'} className="row collapse px-2">
                    { body_pkg }
                    { body_enum }
                    { body_class }
                    { body_function }
                </div>
            )
        }

        return <Card_Template key={ i } { ...tmp_pkg } />
    }

    render() {
        let api = Object.keys(jadn_api).map((pkg, i) => {
            var data = jadn_api[pkg]
			data.header = pkg
            return this.pkg_format(data, i)
        })

        return (
            <DocumentMeta { ...this.meta } extend >
                <div className='row mx-auto'>
                    <div className="row">
                        <div className="col-12">
                            <h1 className="text-center">JADN</h1>
                            <p>JSON Abstract Data Notation (JADN) is a language-neutral, platform-neutral, and format-neutral mechanism for serializing structured data.  See <a href="docs/jadn-overview.md">docs</a> for	information about the JADN language.</p>
                        </div>
                        <div className="col-12">
                            <h3>Python API</h3>
                            <p>The JADN Python API (<a href="jadn">libs</a>) is for v1.0</p>
                        </div>
                    </div>

                    <div id="api" className="row p-3">
                        { api }
			        </div>
                </div>
            </DocumentMeta>
        )
    }
}


function mapStateToProps(state) {
    return {
    }
}


function mapDispatchToProps(dispatch) {
    return {
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Converter)
