import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import NewWindow from 'react-new-window'

import {
    Redirect
} from 'react-router-dom'

import JSONInput from 'react-json-editor-ajrm'
import locale from 'react-json-editor-ajrm/locale/en'

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import {
    escaped2cbor,
    format,
    hexify,
    loadURL,
    minify
} from '../utils'

import * as ConvertActions from '../../actions/convert'
import * as ValidateActions from '../../actions/validate'
import * as UtilActions from '../../actions/util'

const vkbeautify = require('vkbeautify')
const fmt = require('string-format')
const parser = require('html-react-parser')

class Converter extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            conv_tooltip: false,
            schema_opts_dropdown: false,
            schema: {
				schema: {
				    placeholder: 'Paste JADN schema here'
				},
				selected: 'empty',
				file: false,
				url: false,
				url_str: ''
			},
			convert: {
			    selected: 'empty',
			    html: false,
			    popup: null
			}
        }

        this.download_mime = {
			proto3: 'text/x-c',
			rng: 'application/xml',
			html: 'text/html',
			md: 'text/plain',
			cddl: 'text/plain',
			thrift: 'text/plain'
		}

		this.schema_height = 40+'em'

		this.selectChange = this.selectChange.bind(this)
		this.fileChange = this.fileChange.bind(this)

        this.props.info()
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState
        return props_update || state_update
    }

    submitForm(e) {
        e.preventDefault()

        let schema = this.state.schema.schema
        if (typeof(this.state.schema.schema) == 'string') {
            try {
                schema = JSON.parse(schema)
            } catch (err) {
                console.log(err.message)
                toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING})
                return
            }
        }

        this.props.validateSchema(schema).then(() => {
            let valid = this.props.validSchema
            if (valid.valid_bool){
                this.props.convertSchema(
                    this.state.schema.schema,
                    this.state.convert.selected
                ).then(() => {
                    // let valid = this.props.validMessage
                    // toast(<p>{ valid.valid_msg }</p>, {type: toast.TYPE[valid.valid_bool ? 'INFO' : 'WARNING']})
                    console.log('CONVERT RESPONSE')
                })
            } else {
                toast(<p>{ valid.valid_msg }</p>, {type: toast.TYPE[valid.valid_bool ? 'INFO' : 'WARNING']})
            }
        })

        return false
    }

   	selectChange(e) {
		let type = e.target.id.split('-')[0]
        let selected = e.target.value
		let rtn = false
		let update_arr = {
			selected: selected
		}

		switch(selected) {
			case '':
			case null:
				update_arr.file = false
				update_arr.url = false
				rtn = true
				break;
			case 'empty':
				update_arr.file = false
				update_arr.url = false
				if (type == 'message') {
					update_arr.format = ''
					update_arr.decode = ''
				}
				rtn = true
				break;
			case 'file':
				update_arr.file = true
				update_arr.url = false
				rtn = true
				break;
			case 'url':
				update_arr.file = false
				update_arr.url = true
				rtn = true
				break;
			default:
				update_arr.file = false
				update_arr.url = false
		}

		this.setState({
			[type]: {
				...this.state[type],
				...update_arr
			}
		})

		if (rtn) {
			return
		} else {
		    let format = {}
            if (type == 'message') {
                format.format = selected.split('.')[1]
            }

		    if (Object.keys(this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s']).indexOf(selected) == -1) {
                this.props.loadFile(type+'s', selected).then(() => {
                    this.setState({
                        [type]: {
                            ...this.state[type],
                            ...format,
                            [type]: this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s'][selected]
                        }
                    })
                })
            } else {
                this.setState({
                    [type]: {
                        ...this.state[type],
                        ...format,
                        [type]: this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s'][selected]
                    }
                })
            }
		}
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
            this.setState({ [id]: {...this.state[id], [id]: data }})

			if (id == "schema") {
			    this.setState({ schema: {...this.state.schema, schema: data }})
			} else if (id == 'message') {
			    this.setState({ message: {...this.state.message, format: type == 'jadn' ? 'json' : type }})
			}
    	}

    	fileReader.readAsDataURL(file)
	}

    format(t, ind=2) {
        if (t == 'message' || t == 'message-json') {
            let message = t == 'message' ? this.state.message.message : this.state.message.json
            let fmt = t == 'message' ? this.state.message.format : 'json'
            let msg = format(message, fmt, 2)

            if (msg.startsWith('Error')) {
                toast(<p>{ str_fmt('{type} {err}', {type: t.charAt(0).toUpperCase() + t.slice(1), err: msg}) }</p>, {type: toast.TYPE.WARNING})
                return
            }

            this.setState({ message: {...this.state.message, [t == 'message' ? 'message' : 'json']: msg }})
        } else if (t == 'schema') {
            try {
                this.setState({ schema: {...this.state.schema, schema: this.state.schema.schema }})
            } catch (e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Invalid, cannot format: " + e.message
                toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING})
            }
        }
    }

    minify(t) {
        if (t == 'message' || t == 'message-json') {
            let message = t == 'message' ? this.state.message.message : this.state.message.json
            let fmt = t == 'message' ? this.state.message.format : 'json'
            let msg = minify(message, fmt)

            if (msg.startsWith('Error')) {
                toast(<p>{ str_fmt('{type} {err}', {type: t.charAt(0).toUpperCase() + t.slice(1), err: msg}) }</p>, {type: toast.TYPE.WARNING})
                return
            }
            this.setState({ message: {...this.state.message, [t == 'message' ? 'message' : 'json']: msg }})
        } else if (t == 'schema') {
		    try {
                this.setState({ schema: {...this.state.schema, schema: vkbeautify.jsonmin(this.state.schema.schema) }})
            } catch (e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Invalid, cannot format: " + e.message
                toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING})
            }
        }
    }

    verifySchema() {
        let schema = this.state.schema.schema
        if (typeof(this.state.schema.schema) == 'string') {
            try {
                schema = JSON.parse(schema)
            } catch (err) {
                console.log(err.message)
                toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING})
                return
            }
        }

        this.props.validateSchema(schema).then(() => {
            let valid = this.props.validSchema
            toast(<p>{ valid.valid_msg }</p>, {type: toast.TYPE[valid.valid_bool ? 'INFO' : 'WARNING']})
        })
    }

    loadURL(t) {
        let url = this.state[t].url_str
        let file = url.substring(url.lastIndexOf("/") + 1)
        let fileExt = file.substring(file.lastIndexOf(".") + 1)

        if (['json', 'jadn'].indexOf(fileExt) == -1 && t == 'schema') {
		    toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING})
		    return
		}

        loadURL(url).then((data) => {
            this.setState({[t]: {...this.state[t], [t]: data.data, format: fileExt == 'jadn' ? 'json' : data.fileExt }})
        }).catch((err) => {
            console.log("failed to load ", url, err.stack)
            toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING})
        })
    }

    downloadConfig() {
        let rtn = {
            content: '',
			file: ''
	    }

        if (this.props.convertedSchema.convert) {
            let schema = this.props.convertedSchema.convert
            let fmt = this.props.convertedSchema.fmt

            rtn.file = 'schema.' + fmt

            switch (fmt) {
                case 'jadn': //application/json
                    rtn.content = fmt("data:application/json;charset=utf-8,{conv}", {conv: encodeURIComponent(schema)})
                    break;
                case 'proto3': //text/x-c
                case 'rng': //application/xml
                case 'html': //text/html
                case 'md': //text/plain
                case 'cddl': //text/plain
                case 'thrift': //text/plain
                    rtn.content = fmt("data:{data};charset=utf-8,{conv}", {data: this.download_mime[fmt], conv: encodeURIComponent(schema)})
                    break;
                default:
                    rtn.content = fmt("data:text/plain;charset=utf-8,{conv}", {conv: encodeURIComponent('Theres some issues....')})
                    break
            }

            if (fmt == 'html' && this.state.convert.html == false) {
                setTimeout(() => this.setState({
                    convert: {
                        ...this.state.convert,
                        html: true
                    }
                }), 100)
            } else if (fmt != 'html' && this.state.convert.html != false) {
                 setTimeout(() => this.setState({
                    convert: {
                        ...this.state.convert,
                        html: false
                    }
                }), 100)
            }

        }
        return rtn
    }

    viewPage(e) {
        e.preventDefault()
        console.log('View schema as page')


        let schema = parser(this.props.convertedSchema.convert).props.children.filter((c) => c.type === 'body')
        schema = schema.length == 1 ? schema[0].props.children : ''
        schema = schema.filter((elm) => typeof(elm) != 'string')

        this.setState({
            convert: {
                ...this.state.convert,
                popup: (
                    <NewWindow
                        title="HTML Schema"
                        center="screen"
                        onUnload={() => this.setState({ convert: { ...this.state.convert, popup: null } }) }
                    >
                        {
                            // eslint-disable-next-line
                            schema
                        }
                    </NewWindow>
                )
            }
        })
    }

    render() {
        let download = this.downloadConfig()

        // <option value="{{ opt }}" {% if request.form['schema-list'] == opt %}selected=""{% endif %}>{{ opt }}</option>
        let schema_opts =  this.props.schemas.map((s, i) => <option key={ i } value={ s } >{ s }</option>)

        // <option value="{{ options.convs[conv] }}" {% if request.form['convert-to'] == options.convs[conv] %}selected=""{% endif %}>{{ conv }}</option>
        let convert_opts =  Object.entries(this.props.conversions).map(([d, c], i) => <option key={ i } value={ c } >{ d }</option>)

        return (
            <div className='row mx-auto'>
                <Form className="mx-auto col-12" onSubmit={ this.submitForm.bind(this) }>
                    <div className="form-row">
                        <fieldset className="col-6 p-0 float-left">
                            <legend>JADN Schema</legend>

							<div className="form-control border card-body p-0" style={{height: this.schema_height}}>
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

                            <div className="col-12 m-1"></div>

                            <ButtonDropdown isOpen={ this.state.schema_opts_dropdown } toggle={ () => this.setState({ schema_opts_dropdown: !this.state.schema_opts_dropdown }) } className="float-right">
                                 <DropdownToggle caret color="info" size="sm">
                                    Schema Options
                                </DropdownToggle>
                                <DropdownMenu>
                                     {/*
                                     <DropdownItem onClick={ () => this.format('schema') }>Format</DropdownItem>
                                     <DropdownItem onClick={ () => this.format('schema') }>Verbose</DropdownItem>
                                     <DropdownItem onClick={ () => this.minify('schema') }>Minify</DropdownItem>
                                     */}
                                     <DropdownItem onClick={ () => this.verifySchema() }>Verify</DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>

                            <div className="form-row">
                                <div className="form-group col-md-5 pr-1 pl-1">
                                    <select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
                                        <option value="empty">Schema</option>
                                        { schema_opts }
                                        <option disabled="">──────────</option>
                                        <option value="file">File...</option>
                                        <option value="url">URL...</option>
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
                        </fieldset>

                        <fieldset className="col-6 p-0 float-left">
                            <legend>Converted Schema</legend>

                            <div className="form-control border p-0" style={{height: this.schema_height}}>
                                <textarea
                                    placeholder="Converted JADN schema"
                                    style={{
                                        resize: 'none',
                                        outline: 'none',
                                        width: 100+'%',
                                        padding: 10+'px',
                                        border: 'none',
                                        height: 100+'%',
                                    }}
                                    value={ this.props.convertedSchema.convert || '' }
                                    readOnly
                                />
                            </div>

                            <div className="col-12 m-1"></div>

                            <a className="btn btn-sm btn-primary float-right" href={ download.content } download={ download.file } target="_blank">Download</a>

                            <a className={ "btn btn-sm btn-secondary float-right mr-2" + (this.state.convert.html ? '' : ' d-none') } href="#" onClick={ this.viewPage.bind(this) }>View Page</a>

                            { this.state.convert.popup }
                        </fieldset>
                    </div>

                    <div className="col-12"></div>

                    <div className="form-group">
                        <div className="form-group col-md-3 pr-1 pl-1">
                            <select id="convert-to" name="convert-to" className="form-control" default="empty" onChange={ (e) => this.setState({ convert: {...this.state.convert, selected: e.target.value } }) }>
                                <option value="empty">Convert To...</option>
                                { convert_opts }
                            </select>
                        </div>

                        <Button outline color="primary" type="submit" id="conv_tooltip">Convert</Button>
                        <Tooltip placement="bottom" isOpen={ this.state.conv_tooltip } target="conv_tooltip" toggle={ () => this.setState({ conv_tooltip: !this.state.conv_tooltip }) }>
                            Convert the given JADN schema to the selected format
                        </Tooltip>
                        <Button outline color="danger" type="reset" onClick={ () => { this.setState({ schema: {...this.state.schema, schema: '', conv: '' }}) }} >Reset</Button>
                    </div>
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        schemas: state.Convert.schemas || [],
        loadedSchemas: state.Util.loaded.schemas || [],
		validSchema: state.Validate.valid.schema || {},

        conversions: state.Convert.conversions || {},
        convertedSchema: state.Convert.converted || {}
    }
}


function mapDispatchToProps(dispatch) {
    return {
    	info: () => dispatch(ConvertActions.info()),
    	convertSchema: (s, t) => dispatch(ConvertActions.convertSchema(s, t)),
		loadFile: (t, f) => dispatch(UtilActions.load(t, f)),
        validateSchema: (s) => dispatch(ValidateActions.validateSchema(s)),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Converter)
