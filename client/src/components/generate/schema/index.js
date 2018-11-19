import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'
import { toast } from 'react-toastify'

import {
    Redirect
} from 'react-router-dom'

import JSONPretty from 'react-json-pretty'

import { Button, ButtonGroup, ListGroup, ListGroupItem, TabContent, TabPane, Tooltip } from 'reactstrap'

import { Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

import { Draggable, Droppable } from 'react-drag-and-drop'

import SchemaStructure from './lib/structure'

import {
    escaped2cbor,
    format,
    hexify,
    loadURL,
    minify,
    validURL
} from '../../utils'

import JSONInput from '../../utils/jadn-editor'
import locale from '../../utils/jadn-editor/locale/en'

import * as ValidateActions from '../../../actions/validate'
import * as UtilActions from '../../../actions/util'
import * as GenActions from '../../../actions/generate'

const str_fmt = require('string-format')

class Generate extends Component {
    constructor(props, context) {
        super(props, context)

		this.state = {
		    schema: {},
		    activeOption: 'meta',
		    activeView: 'editor'
		}

		this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Creator-Schema'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

        this.keys = SchemaStructure

		this.onDrop = this.onDrop.bind(this)

        this.props.info()
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        return props_update || state_update
    }

    onDrop(data) {
        if (data.meta) {
            if (!(data.meta in (this.state.schema.meta || {}))) {
                this.setState((prevState) => ({
                    schema: {
                        ...prevState.schema,
                        meta: {
                            ...prevState.schema.meta || {},
                            ...this.keys.meta[data.meta].edit()
                        }
                    }
                }))
            }
        } else if (data.types) {
            this.setState((prevState) => {
                let tmpTypes = prevState.schema.types || []
                let tmpDef = this.keys.types[data.types].edit()
                if ((tmpTypes.filter(d => d[0] === tmpDef[0]) || []).length === 0) {
                    tmpTypes.push(tmpDef)
                }
                return {
                    schema: {
                        ...prevState.schema,
                        types: tmpTypes
                    }
                }
            })
        } else {
            console.log('oops...')
        }
    }

    schemaEditor() {
        let metaEditors = Object.keys(this.state.schema.meta || {}).map((k, i) => {
            return this.keys.meta[k].editor({
                key: i,
                value: this.state.schema.meta[k],
                placeholder: k,
                change: (val) => this.setState((prevState) => ({
                    schema: {
                        ...prevState.schema,
                        meta: {
                            ...prevState.schema.meta,
                            ...this.keys.meta[k].edit(val)
                        }
                    }
                })),
                remove: (id) => {
                    if (id in this.state.schema.meta) {
                        this.setState((prevState) => {
                            let tmpMeta = { ...prevState.schema.meta }
                            delete tmpMeta[id]

                            return {
                                schema: {
                                    ...prevState.schema,
                                    meta: tmpMeta
                                }
                            }
                        })
                    }
                }
            })
        })

        let typesEditors = (this.state.schema.types || []).map((def, i) => {
            let type = def[1].toLowerCase()

            return this.keys.types[type].editor({
                key: i,
                value: def,
                dataIndex: i,
                change: (val, idx) => this.setState((prevState) => {
                    let tmpTypes = [ ...prevState.schema.types ]
                    tmpTypes[idx] = this.keys.types[val.type.toLowerCase()].edit(val)
                    return {
                        schema: {
                            ...prevState.schema,
                            types: tmpTypes
                        }
                    }
                }),
                remove: (idx) => {
                    if (this.state.schema.types.length >= idx) {
                        this.setState((prevState) => {
                            let tmpTypes = [ ...prevState.schema.types ]
                            tmpTypes.splice(idx, 1)
                            return {
                                schema: {
                                    ...prevState.schema,
                                    types: tmpTypes
                                }
                            }
                        })
                    }
                }
            })
        })

        return (
            <div>
                <div className='col-12'>
                    <h2>Meta</h2>
                    { metaEditors }
                </div>
                <hr />
                <div className='col-12'>
                    <h2>Types</h2>
                    { typesEditors }
                </div>
            </div>
        )
    }

    downloadConfig() {
        let formattedJADN = 'TEST' // this.state.schema
        return {
            content: str_fmt("data:application/json;charset=utf-8,{conv}", {conv: encodeURIComponent(formattedJADN)}),
			file: 'schema.jadn'
	    }
	}

    toggleOptions(opt) {
        if (this.state.activeOption !== opt) {
            this.setState({
                activeOption: opt
            })
        }
    }

    toggleViews(view) {
        if (this.state.activeView !== view) {
            this.setState({
                activeView: view
            })
        }
    }

    render() {
        let metaKeys = Object.keys(this.keys.meta).map((k, i) => (
            <Draggable type="meta" data={ k } key={ i }>
                <ListGroupItem action>{ this.keys.meta[k].key }</ListGroupItem>
            </Draggable>
        ))

        let typesKeys = Object.keys(this.keys.types).map((k, i) => (
            <Draggable type="types" data={ k } key={ i }>
                <ListGroupItem action>{ this.keys.types[k].key }</ListGroupItem>
            </Draggable>
        ))

        let download = this.downloadConfig()

        return (
            <DocumentMeta { ...this.meta } extend >
                <div className='row mx-auto'>
                    <div id='schema-options' className='col-md-2'>
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={ classnames({ active: this.state.activeOption === 'meta' }) }
                                    onClick={ () => this.toggleOptions('meta') }
                                >Meta</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={ classnames({ active: this.state.activeOption === 'types' }) }
                                    onClick={ () => this.toggleOptions('types') }
                                >Types</NavLink>
                            </NavItem>
                        </Nav>

                        <TabContent activeTab={ this.state.activeOption }>
                            <TabPane tabId='meta'>
                                <ListGroup>
                                    { metaKeys }
                                </ListGroup>
                            </TabPane>
                            <TabPane tabId='types'>
                                <ListGroup>
                                    { typesKeys }
                                </ListGroup>
                            </TabPane>
                        </TabContent>

                        <div className='col-12 m-2' />

                        <a className="btn btn-sm btn-primary " href={ download.content } download={ download.file } target="_blank">Download Schema</a>
                    </div>

                    <div id='schema-view' className='col-md-10'>
                        <Nav tabs>
                            <NavItem>
                                <NavLink
                                    className={ classnames({ active: this.state.activeView === 'editor' }) }
                                    onClick={ () => this.toggleViews('editor') }
                                >Editor</NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={ classnames({ active: this.state.activeView === 'code' }) }
                                    onClick={ () => this.toggleViews('code') }
                                >Code</NavLink>
                            </NavItem>
                        </Nav>

                        <Droppable
                            types={ ['meta', 'types'] } // <= allowed drop types
                            onDrop={ this.onDrop }
                            className='border col-12 p-0'
                            style={{
                                minHeight: 20+'em'
                            }}
                        >
                            <TabContent activeTab={ this.state.activeView }>
                                <TabPane tabId='editor'>
                                   { this.schemaEditor() }
                                </TabPane>
                                <TabPane tabId='code'>
                                    <div className="form-control m-0 p-0" style={{ minHeight: 20+'em' }}>
                                        <JSONInput
                                            id='jadn_schema'
                                            placeholder={ this.state.schema }
                                            onChange={ (val) => {
                                                if (val.jsObject) {
                                                    this.setState({ schema: val.jsObject })
                                                }
                                            }}
                                            theme='light_mitsuketa_tribute'
                                            locale={ locale }
                                            //reset={ true }
                                            height='100%'
                                            width='100%'
                                            viewOnly={ true }
                                            //waitAfterKeyPress={ 500 }
                                        />
                                    </div>
                                </TabPane>
                            </TabContent>
                        </Droppable>
                    </div>
                </div>
            </DocumentMeta>
        )
    }
}

function mapStateToProps(state) {
    return {
        schemas: state.Generate.schemas,
        loadedSchemas: state.Util.loaded.schemas || {},
		validSchema: state.Validate.valid.schema || {},
        selectedSchema: state.Generate.selectedSchema,

        message: state.Generate.message,

        siteTitle: state.Util.site_title
    }
}


function mapDispatchToProps(dispatch) {
    return {
		info: () => dispatch(GenActions.info()),
		loadFile: (t, f) => dispatch(UtilActions.load(t, f)),

        validateSchema: (s) => dispatch(ValidateActions.validateSchema(s)),

        setSchema: (schema) => dispatch(GenActions.setSchema(schema))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Generate)
