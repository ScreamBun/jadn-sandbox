import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'
import { toast } from 'react-toastify'

import {
    Redirect
} from 'react-router-dom'

import JSONPretty from 'react-json-pretty'

import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip } from 'reactstrap';

import {
    delMultiKey,
    Field,
    FormatJADN,
    getMultiKey,
    setMultiKey
} from './lib'

import {
    escaped2cbor,
    format,
    hexify,
    loadURL,
    minify,
    validURL
} from '../utils'

import * as ValidateActions from '../../actions/validate'
import * as UtilActions from '../../actions/util'
import * as GenActions from '../../actions/generate'

const str_fmt = require('string-format')


class Command_Generator extends Component {
    constructor(props, context) {
        super(props, context)

		this.state = {
		    command_record: '',
		    schema: {
				schema: {
				    placeholder: 'Paste JADN schema here'
				},
				selected: 'empty',
				decodeTypes: {
				    all: [],
				    exports: []
				},
				file: false,
				url: false,
				url_str: ''
			},
		    message: {}
		}

		this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Creator'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
        }

		this.optChange = this.optChange.bind(this)

		this.selectChange = this.selectChange.bind(this)
		this.fileChange = this.fileChange.bind(this)

        this.props.info()
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState

        if (this.state.schema.schema != nextState.schema.schema) {
            this.props.setSchema(nextState.schema.schema)
            nextState.message = {}
        }

        return props_update || state_update
    }

    makeID() {
        console.log('Make ID')
        this.setState({
            message: {
                ...this.state.message,
                id: this.genUUID()
            }
        })
    }

    validUUID(uuid) {
        if (!uuid) {
            return false
        }

        let pattern = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/
        return uuid.match(pattern) ? true : false
    }

    genUUID() {
	    let d = new Date().getTime();
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			let r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		})
	}

    optChange(k, v) {
        // console.log(k, v)

        this.setState((prevState) => {
            let msg = prevState.message || {}
            let keys = k.split('.')
            if (keys.length > 1 && msg[keys[0]] && !msg[keys[0]][keys[1]]) {
                delMultiKey(msg, keys[0])
            }

            if (['', ' ', null, undefined, [], {}].indexOf(v) == -1) {
                setMultiKey(msg, k, v)
            } else {
                delMultiKey(msg, k)
            }

            return {
                message: msg
            }
        })
    }

    selectChange(e) {
		let type = e.target.id.split('-')[0]
        let selected = e.target.value
		let rtn = false
		let update_arr = {
			selected: selected,
			file: selected == 'file',
			url: selected == 'url'
		}

		if (selected == 'empty' && type == 'message') {
		    update_arr.format = ''
			update_arr.decode = ''
		}

		this.setState((prevState) => {
            return {
                [type]: {
			        ...prevState[type],
		            ...update_arr
			    }
            }
		}, () => {
		    let selected = this.state[type].selected
		    let loaded = this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s']

		    if (['', 'empty', null, 'file', 'url'].indexOf(selected) == -1) {
		        let format = {}
		        if (type == 'message') format.format = selected.split('.')[1]

                if (Object.keys(loaded).indexOf(selected) == -1) {
                    this.props.loadFile(type+'s', selected).then(() => {
                        this.setState((prevState) => {
                            return {
                                [type]: {
                                    ...prevState[type],
                                    ...format,
                                    [type]: this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s'][selected]
                                }
                            }
                        })
                    })

                } else {
                    this.setState((prevState) => {
                        return {
                            [type]: {
                                ...this.state[type],
                                [type]: this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s'][selected]
                            }
                        }
                    })
                }
		    }
		})
	}

	fileChange(e) {
		let id = e.target.id.split('-')[0]
        let file = e.target.files[0]
	    let type = file.name.split('.')[1]
		let fileReader = new FileReader()

		fileReader.onload = e => {
			let data = atob(fileReader.result.split(',')[1])
			try {
				data = JSON.stringify(JSON.parse(data), null, 2)
            } catch(e) {
                switch (type) {
                    case 'cbor':
				        data = escaped2cbor(hexify(data))
				        break;
                }
            }

			if (id == "schema") {
			    try {
                    this.setState({
                        schema: {
                            ...this.state.schema,
                            schema: JSON.parse(data)
                        }
                    })
                } catch (e) {
                    toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING})
                }
			} else if (id == 'message') {
			    this.setState({
			        message: {
			            ...this.state.message,
			            format: type == 'jadn' ? 'json' : type,
			            message: data
			        }
			    })
			}
    	}

    	fileReader.readAsDataURL(file)
	}

	loadURL(t) {
        let url = this.state[t].url_str

        if (!validURL(url)) {
            toast(<p>Invalid URL, cannot load from a non valid location</p>, {type: toast.TYPE.WARNING})
		    return
        }

        let file = url.substring(url.lastIndexOf("/") + 1)
        let fileExt = file.substring(file.lastIndexOf(".") + 1)

        if (['json', 'jadn'].indexOf(fileExt) == -1 && t == 'schema') {
		    toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING})
		    return
		}

        loadURL(url).then((data) => {
            this.setState({[t]: {...this.state[t], [t]: data.data, format: fileExt == 'jadn' ? 'json' : data.fileExt }})
        }).catch((err) => {
            toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING})
        })
    }

     verifySchema() {
        let schema = this.state.schema.schema
        if (typeof(this.state.schema.schema) == 'string') {
            try {
                schema = JSON.parse(schema)
            } catch (err) {
                toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING})
                return
            }
        }

        this.props.validateSchema(schema).then(() => {
            let valid = this.props.validSchema
            toast(<p>{ valid.valid_msg }</p>, {type: toast.TYPE[valid.valid_bool ? 'INFO' : 'WARNING']})
        })
    }

    cmdCreator(maxHeight) {
        let export_records = this.props.selectedSchema && this.props.selectedSchema.meta ? this.props.selectedSchema.meta.exports : []

        let record_def = this.props.selectedSchema.hasOwnProperty('types') ? this.props.selectedSchema.types.filter(type => type[0] == this.state.command_record) : []
        record_def = (record_def.length == 1 ? record_def[0] : [])

        return (
            <div className='col-md-6'>
                 <ul className='nav nav-tabs'>
			        <li className='nav-item'>
				        <a className='nav-link active show' data-toggle='tab' href='#tab-creator'>Creator</a>
  			        </li>

  			        <li id='msg-tab' className='nav-item' >
    			        <a className='nav-link' data-toggle='tab' href='#tab-message'>Message</a>
  			        </li>
		        </ul>

		        <div className='tab-content'>
		            <div className='tab-pane fade active show' id='tab-creator'>
                        <div className='card col-12 p-0 mx-auto'>
                            <div className='card-header'>
                                <FormGroup className='col-md-6 p-0 m-0 float-left'>
                                    <Input type='select' name='command-list' id='command-list' className='form-control' default='' onChange={ (e) => { this.setState({'command_record': e.target.value}) }}>
                                        <option value=''>Command Type</option>
                                        {
                                            export_records.map((rec, i) => {
                                                return <option key={ i } value={ rec }>{ rec }</option>
                                            })
                                        }
                                    </Input>
                                </FormGroup>

                                <Button color='primary' className='float-right' onClick={ () => this.makeID() }>Generate ID</Button>
                            </div>

                            <Form id='command-fields' className='card-body' onSubmit={ () => { return false; } } style={{ height: maxHeight-25+'px', overflowY: 'scroll' }}>
                                {
                                    (record_def.length > 1 && record_def[record_def.length - 2].length > 0) ?
                                    <FormText color="muted"><b>Comment: </b>{ record_def[record_def.length - 2] }</FormText> : ''
                                }
                                <div id="fieldDefs">
                                    {
                                        record_def[record_def.length - 1] == undefined ?
                                            <FormText color="muted">Command Fields will appear here after selecting a type { this.state.command_record }</FormText>
                                        : record_def[record_def.length - 1].map((def, i) => <Field key={ i } def={ def } optChange={ this.optChange } />)
                                    }
                                </div>
                            </Form>
                        </div>
                    </div>

                    <div className='tab-pane fade position-relative' id='tab-message' style={{ height: maxHeight+'px' }}>
                        <JSONPretty
                            id='message'
                            className='scroll-xl border'
                            style={{ minHeight: 2.5+'em' }}
                            json={ this.state.message }
                        />
                    </div>
                </div>
            </div>
        )
    }

    schema(maxHeight) {
		// list of options - <option value="{{ opt }}">{{ opt }}</option>
        let schema_opts = this.props.schemas.map((s, i) => <option key={ i } value={ s }>{ s }</option>)

        return (
            <div className='col-md-6'>
                <div id="schema-card" className="tab-pane fade active show">
				    <div className="card">
					    <div className="card-header">
						    <div className="row float-left col-sm-10 pl-0">
							    <div className="form-group col-md-6 pr-0 pl-1">
								    <select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
									    <option value="empty">Schema</option>
                                            <optgroup label="Testers">
						                        { schema_opts }
                                            </optgroup>
                                            <optgroup label="Custom">
						                        <option value="file">File...</option>
										        <option value="url">URL...</option>
                                            </optgroup>
								    </select>
								</div>

								<div id="schema-file-group" className={ "form-group col-md-6 px-1" + (this.state.schema.file ? '' : ' d-none') } >
									<input type="file" className="btn btn-light form-control-file" id="schema-file" name="schema-file" accept=".jadn" onChange={ this.fileChange } />
								</div>

								<div id="schema-url-group" className={ "form-group col-md-6 px-1" + (this.state.schema.url ? '' : ' d-none') }>
									<div className="input-group">
								        <div className="input-group-prepend">
											<Button color="info" onClick={ () => this.loadURL('schema') }>Load URL</Button>
										</div>
										<input type="text" className="form-control" default='' onChange={ (e) => this.setState({ schema: {...this.state.schema, url_str: e.target.value }}) } />
									</div>
								</div>
							</div>

							<ButtonGroup className="float-right">
								<Button outline color="secondary" onClick={ () => this.verifySchema() } id="ver_tooltip" >Verify</Button>
								<Tooltip placement="bottom" isOpen={ this.state.ver_tooltip } target="ver_tooltip" toggle={ () => this.setState({ ver_tooltip: !this.state.ver_tooltip }) }>
                                    Validate the schema is valid prior to validating the message
                                </Tooltip>
						    </ButtonGroup>
						</div>

                        <div className="form-control border card-body p-0" style={{ height: maxHeight+'px' }}>
                            <JSONInput
                                id='jadn_schema'
                                placeholder={ this.state.schema.schema }
                                onChange={ (val) => {
                                    if (val.jsObject) {
                                        this.setState({ schema: {...this.state.schema, schema: val.jsObject }})
                                    }
                                }}
                                theme='light_mitsuketa_tribute'
                                locale={ locale }
                                reset={ false }
                                height='100%'
                                width='100%'
                            />
                        </div>
					</div>
				</div>
            </div>
        )
    }

    render() {
        let maxHeight = window.innerHeight-225

        return (
            <DocumentMeta { ...this.meta } extend >
                <div className='row mx-auto'>
                    { this.schema(maxHeight) }

                    <div className='col-12 m-2 d-md-none' />

                    { this.cmdCreator(maxHeight) }

                    <div className='col-12' style={{ height: 1.25+'em' }}/>

                    <div id='cmd-status' className='modal'>
                        <div className='modal-dialog h-100 d-flex flex-column justify-content-center my-0' role='document'>
                            <div className='modal-content'>
                                <div className='modal-header'>
                                    <h5 className='modal-title'>Command: <span></span></h5>
                                    <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                                        <span aria-hidden='true'>&times;</span>
                                    </button>
                                </div>

                                <div className='modal-body'>
                                    <p className='cmd-details'><b>Details:</b> <span></span></p>

                                    <p className='mb-1'><b>Command:</b></p>
                                    <pre className='border code command' />

                                    <p className='mb-1'><b>Responses:</b></p>
                                    <div className='p-1 border border-primary responses' />
                                </div>

                                <div className='modal-footer'>
                                    <button type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
                                </div>
                            </div>
                        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Command_Generator)
