import React, { Component } from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import {
    Redirect
} from 'react-router-dom'

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip } from 'reactstrap'

import { FormatJADN } from '../cmd_gen/lib'
import * as ValidateActions from '../../actions/validate'

const vkbeautify = require('vkbeautify')


class Validator extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            val_tooltip: false,
            ver_tooltip: false,
			message: {
				message: '',
				format: '',
				decode: '',
				selected: 'empty',
				file: false,
				url: false,
			},
			schema: {
				schema: '',
				selected: 'empty',
				decodeTypes: {
				    all: [],
				    exports: []
				},
				file: false,
				url: false
			}
        }
		this.props.info()
		
		this.selectChange = this.selectChange.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        let props_update = this.props != nextProps
        let state_update = this.state != nextState
		
        return props_update || state_update
    }

    submitForm(e) {
        e.preventDefault()

        return false
    }
	
	selectChange(e) {
		let type = $(e.target).attr("id").split('-')[0]
        let selected = $(e.target).val()
		let decodeType = $(e.target).find('option:selected').attr('decode')
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
                    if (type == 'schema') {
                        this.loadDecodeTypes()
                    }
                })
            } else {
                this.setState({
                    [type]: {
                        ...this.state[type],
                        ...format,
                        [type]: this.props['loaded'+type[0].toUpperCase()+type.slice(1)+'s'][selected]
                    }
                })
                if (type == 'schema') {
                    this.loadDecodeTypes()
                }
            }
		}
		
		/*
        $.get(
            "/load/"+type+"s/"+selected,
            function(data) {
				if (data['type'] == type+"s" && data['file'] == selected) {
					$("#"+type).removeClass('minify format')
					
					if (type == "message") {
						t = data['file'].split('.')[1]
						$("#message-format").val(t)
						switch(t) {
							case 'cbor':
								$("#"+type).addClass('minify')
								d = cbor2bytes(data['data'])
								break
							default:
								d = data['data']
						}
						$("#"+type).text(d).val(d)
						if (decodeType != undefined) {
							$('#message-decode').val(decodeType)
						}
						
					} else if (type == "schema") {
						$("#"+type).text(data['data']).val(data['data'])
						
					}
				} else {
					alertMsg("#alert-container", "Cannot load data")
				}
            }
        ).fail(function() {
			alertMsg("#alert-container", "Cannot load data")
        })
		*/
	}

    format(t, ind=2) {
        if (t == 'message') {
            try {
                let message = ''
                switch (this.state.message.format) {
                    case "cbor":
                        message = this.state.message.message
                         toast(<p>CBOR cannot be formatted</p>, {type: toast.TYPE.INFO})
                        break
                    case "json":
                        message = vkbeautify.json(this.state.message.message, ' '.repeat(ind))
                        break
                    case "xml":
                        message = vkbeautify.xml(this.state.message.message, ' '.repeat(ind))
                        break
                    default:
                        let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Error, cannot format " + this.state.message.format + " message"
                        console.log(msg)
                }
                this.setState({ message: {...this.state.message, message: message }})
            } catch(e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Error, cannot format: " + e.message
                console.log(msg)
            }
        } else if (t == 'schema') {
            try {
                this.setState({ schema: {...this.state.schema, schema: FormatJADN(this.state.schema.schema) }})
            } catch (e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Invalid, cannot format: " + e.message
                console.log(msg)
            }
        }
    }

    minify(t) {
        console.log(t)
        if (t == 'message') {
            try {
                let message = ''
                switch (this.state.message.format) {
                    case "cbor":
                        message = this.state.message.message
                         toast(<p>CBOR cannot be minified</p>, {type: toast.TYPE.INFO})
                        break
                    case "json":
                        message = vkbeautify.jsonmin(this.state.message.message, ' '.repeat(ind))
                        break
                    case "xml":
                        message = vkbeautify.xmlmin(this.state.message.message, ' '.repeat(ind))
                        break
                    default:
                        let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Error, cannot format " + this.state.message.format + " message"
                        console.log(msg)
                }
                this.setState({ message: {...this.state.message, message: message }})
            } catch(e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Error, cannot format: " + e.message
                console.log(msg)
            }
        } else if (t == 'schema') {
		    try {
                this.setState({ schema: {...this.state.schema, schema: vkbeautify.jsonmin(this.state.schema.schema) }})
            } catch (e) {
                let msg = t.charAt(0).toUpperCase() + t.slice(1) + " Invalid, cannot format: " + e.message
                console.log(msg)
            }
        }
    }

    verifySchema() {
        if (typeof(this.state.schema.schema) == 'string') {
            try {
                let schema = JSON.parse(this.state.schema.schema)
                this.props.verifySchema(schema)
            } catch (err) {
                console.log(err.message)
                toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING})
            }
        } else {
            this.props.verifySchema(this.state.schema.schema)
        }
    }

    loadURL(t) {}
	
	loadDecodeTypes() {
	    let decodeTypes = {}

	    if (this.state.schema.schema.meta != undefined) {
	        if (this.state.schema.schema.meta.exports != undefined) {
                decodeTypes.exports = this.state.schema.schema.meta.exports
	        }
	    }

	    if (this.state.schema.schema.types != undefined) {
	        decodeTypes.all = this.state.schema.schema.types.map((def) => def[0])
	        decodeTypes.all.sort()
	    }

	    this.setState({
	        schema: {
	            ...this.state.schema,
	            decodeTypes: decodeTypes
	        }
	    })
	}

    jadn() {
		// List of options - <option value="{{ opt }}">{{ opt }}</option>
        let schema_opts = this.props.schemas.map((s, i) => <option key={ i } value={ s }>{ s }</option>)

        return (
            <fieldset>
                <legend>JADN Schema</legend>
                <div className="form-row">
                    <div className="col-md-12 mb-3">
				        <div id="schema-card" className="tab-pane fade active show">
						    <div className="card">
							    <div className="card-header">
									<div className="row float-left col-sm-6 pl-0">
										<div className="form-group col-md-6 pr-0 pl-1">
											<select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
												<option value="empty">Schema</option>
												{ schema_opts }
												<option disabled="">──────────</option>
												<option value="file">File...</option>
												<option value="url">URL...</option>
											</select>
										</div>

										<div id="schema-file-group" className={ "form-group col-md-6 px-1" + (this.state.schema.file ? '' : ' d-none') } >
											<input type="file" className="btn btn-light form-control-file" id="schema-file" name="schema-file" accept=".jadn" />
										</div>

										<div id="schema-url-group" className={ "form-group col-md-6 px-1" + (this.state.schema.url ? '' : ' d-none') }>
											<div className="input-group">
												<div className="input-group-prepend">
													<Button color="info" onClick={ () => loadURL('schema') }>Load URL</Button>
												</div>
												<input type="text" className="form-control" id="schema-url" />
											</div>
										</div>
									</div>

									<ButtonGroup className="float-right">
										<Button outline color="secondary" onClick={ () => this.format('schema') }>Format</Button>
										<Button outline color="secondary" onClick={ () => this.format('schema') }>Verbose</Button>
										<Button outline color="secondary" onClick={ () => this.minify('schema') }>Minify</Button>
										<Button outline color="secondary" onClick={ () => this.verifySchema() } id="ver_tooltip" >Verify</Button>
										<Tooltip placement="bottom" isOpen={ this.state.ver_tooltip } target="ver_tooltip" toggle={ () => this.setState({ ver_tooltip: !this.state.ver_tooltip }) }>
                                            Validate the schema is valid prior to validating the message
                                        </Tooltip>
									</ButtonGroup>
								</div>

								<textarea
									className="form-control border card-body p-2"
									placeholder="Paste JADN schema here"
									rows="10"
									required=""
									value={ typeof(this.state.schema.schema) == 'string' ? this.state.schema.schema : FormatJADN(this.state.schema.schema) }
									onChange={ (e) => this.setState({ schema: {...this.state.schema, schema: e.target.value }}) }
								/>
							</div>
						</div>
					</div>
                </div>
            </fieldset>
        )
    }

    message() {
		// lost of options - <option value="{{ opt.name }}" decode="{{ opt.type }}">{{ opt.name }}</option>
        let msg_opts = Object.entries(this.props.messages).map(([n, t], i) => <option key={ i } value={ n } decode={ t } >{ n }</option>)

        let decodeExports = this.state.schema.decodeTypes.exports.map((dt, i) => <option key={ i } value={ dt } >{ dt }</option>)
        let decodeAll = this.state.schema.decodeTypes.all.map((dt, i) => <option key={ i } value={ dt } >{ dt }</option>)

        if (typeof(this.state.message.message) != 'string') {
            setTimeout(() => this.format('message'), 5)
        }

        return (
            <fieldset>
                <legend>Message</legend>
                <div className="form-row">
                    <div className="col-md-12 mb-3">
						<ul className="nav nav-tabs submitted">
							<li className="nav-item">
								<a className="nav-link active show" data-toggle="tab" href="#message-card">Original</a>
							</li>
							<li className="nav-item">
								<a className="nav-link" data-toggle="tab" href="#json-card">JSON</a>
							</li>
						</ul>

						<div className="tab-content">
							<div id="message-card" className="tab-pane fade active show">
								<div className="card">
									<div className="card-header">
										<div className="row float-left col-sm-6 pl-0">
											<div className="form-group col-md-6 pr-0 pl-1">
												<select id="message-list" name="message-list" className="form-control" default="empty" onChange={ this.selectChange }>
													<option value="empty">Message</option>
													{ msg_opts }
													<option disabled="">──────────</option>
													<option value="file">File...</option>
													<option value="url">URL...</option>
												</select>
											</div>

											<div id="message-file-group" className={ "form-group col-md-6 px-1" + (this.state.message.file ? '' : ' d-none') }>
												<input type="file" className="btn btn-light form-control-file" id="message-file" name="message-file" accept=".json,.xml,.cbor" />
											</div>

											<div id="message-url-group" className={ "form-group col-md-6 px-1" + (this.state.message.url ? '' : ' d-none') }>
												<div className="input-group">
													<div className="input-group-prepend">
														<Button color="info" onClick={ () => loadURL('message') }>Load URL</Button>
													</div>
													<input type="text" className="form-control" id="message-url" />
												</div>
											</div>
										</div>

										<ButtonGroup className="float-right">
											<Button outline color="secondary" onClick={ () => this.format('message') }>Format</Button>
											<Button outline color="secondary" onClick={ () => this.format('message') }>Verbose</Button>
											<Button outline color="secondary" onClick={ () => this.minify('message') }>Minify</Button>
										</ButtonGroup>
									</div>

									<textarea
										className="form-control border card-body p-2"
										placeholder="Paste message to be validated here"
										rows="10"
										required=""
										value={ this.state.message.message }
										onChange={ (e) => this.setState({ message: {...this.state.message, message: e.target.value }}) }
									/>
								</div>
							</div>

							<div id="json-card" className="tab-pane fade">
								<div className="card">
									<div className="card-header">
										<ButtonGroup className="float-right">
											<Button outline color="secondary" onClick={ () => this.format('message-json', indent, 'json') }>Verbose</Button>
											<Button outline color="secondary" onClick={ () => this.minify('message-json', 'json') }>Minify</Button>
										</ButtonGroup>
									</div>

									<textarea className="form-control border card-body" id="message-json" rows="10" readOnly />
								</div>
							</div>
						</div>
					</div>
                </div>

                <div className="form-row-fluid">
					<div className="float-left form-group col-md-3 col-sm-6 pr-1 pl-1">
						<label className="control-label" htmlFor="message-format">Message Format</label>
						<select className="form-control" id="message-format" name="message-format" required="" value={ this.state.message.format } onChange={ (e) => this.setState({ message: {...this.state.message, format: e.target.value }}) } >
							<option value="">Message Format</option>
							<option value="json">json</option>
							<option value="cbor">cbor</option>
							<option value="xml">xml</option>
						</select>
					</div>

					<div className="float-left form-group col-md-3 col-sm-6 pr-1 pl-1">
						<label className="control-label" htmlFor="message-decode">Message Type</label>
						<select className="form-control" id="message-decode" name="message-decode" required="" default="" onChange={ (e) => this.setState({ message: {...this.state.message, decode: e.target.value }}) }>
						    <optgroup label="Exports">
						        { decodeExports }
                            </optgroup>
                            <optgroup label="All">
						        { decodeAll }
                            </optgroup>
						</select>
					</div>
				</div>
            </fieldset>
        )
    }

    render() {
        return (
            <div className='row mx-auto'>
                <Form className="mx-auto col-12 position-relative" onSubmit={ this.submitForm.bind(this) }>
                    <div className="form-group position-absolute" style={{ right: 1.25+'em', zIndex: 100 }}>
                        <Button outline color="primary" id="val_tooltip">Validate</Button>
                        <Tooltip placement="bottom" isOpen={ this.state.val_tooltip } target="val_tooltip" toggle={ () => this.setState({ val_tooltip: !this.state.val_tooltip }) }>
                            Validate the message against the given schema
                        </Tooltip>
                        <Button outline color="danger" type="reset">Reset</Button>
                    </div>

                    { this.jadn() }

                    { this.message() }
                </Form>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
		messages: state.Validate.messages,
		loadedMessages: state.Validate.loaded.messages || {},
		schemas: state.Validate.schemas,
		loadedSchemas: state.Validate.loaded.schemas || {},
    }
}


function mapDispatchToProps(dispatch) {
    return {
		info: () => dispatch(ValidateActions.info()),
		loadFile: (t, f) => dispatch(ValidateActions.load(t, f)),
        verifySchema: (s) => dispatch(ValidateActions.validateSchema(s))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Validator)
