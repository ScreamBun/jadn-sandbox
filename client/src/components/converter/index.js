import React, { Component } from 'react'
import { connect } from 'react-redux'
import DocumentMeta from 'react-document-meta'
import { toast } from 'react-toastify'
import NewWindow from 'react-new-window'

import PopoutWindow from 'react-popout'
import FileSaver from 'file-saver';

import { Button, ButtonGroup, Form, FormGroup, Label, Input, FormText, Tooltip, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import {
    escaped2cbor,
    format,
    hexify,
    loadURL,
    minify,
    validURL
} from '../utils'

import JSONInput from '../utils/jadn-editor'
import locale from '../utils/jadn-editor/locale/en'

import * as ConvertActions from '../../actions/convert'
import * as ValidateActions from '../../actions/validate'
import * as UtilActions from '../../actions/util'

const str_fmt = require('string-format')
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

		this.meta = {
            title: str_fmt('{base} | {page}', {base: this.props.siteTitle, page: 'Converter'}),
            canonical: str_fmt('{origin}{path}', {origin: window.location.origin, path: window.location.pathname})
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
                )
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
                this.setState({ schema: {...this.state.schema, schema: this.state.schema.schema }})
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
                    rtn.content = str_fmt("data:application/json;charset=utf-8,{conv}", {conv: encodeURIComponent(schema)})
                    break;
                case 'proto3': //text/x-c
                case 'rng': //application/xml
                case 'html': //text/html
                case 'md': //text/plain
                case 'cddl': //text/plain
                case 'thrift': //text/plain
                    rtn.content = str_fmt("data:{data};charset=utf-8,{conv}", {data: this.download_mime[fmt], conv: encodeURIComponent(schema)})
                    break;
                default:
                    rtn.content = str_fmt("data:text/plain;charset=utf-8,{conv}", {conv: encodeURIComponent('Theres some issues....')})
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

    downloadPDF(e) {
        e.preventDefault()
        console.log('Download PDF')

        fetch('/api/convert/pdf', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                schema: this.state.schema.schema,
            })
        }).then(
            rsp => rsp.blob()
        ).then(data => {
	        console.log(data)
	        FileSaver.saveAs(data, "schema.pdf");
        }).catch(err => {
            console.log(err)
        })
    }

    viewPage(e) {
        e.preventDefault()
        const nulls = ['', ' ', null, undefined]
        let tmp_html = parser(this.props.convertedSchema.convert.replace(/^\s+/gm, '').replace(/\s+$/gm, ''))

        // CSS Theme
        let theme = tmp_html.props.children.filter((c) => c.type === 'head')
        theme = (theme.length == 1 ? theme[0].props.children : []).filter((e, i) => nulls.indexOf(e) == -1)
        theme = theme.filter((e, i) => e.type == 'style')
        theme = theme.length == 1 ? theme[0] : {}

        // HTML Schema
        let schema = tmp_html.props.children.filter((c) => c.type === 'body')
        schema = schema.length == 1 ? schema[0].props.children : []

        // Remove whitespace - non objects
        const filter = (elm) => {
            if (typeof(elm) == 'string') {
                return (!elm || elm.match(/^[\r\n\s]*?$/m) ? '' : elm)
            } else {
                if (elm.props && elm.props.children) {
                    if (typeof(elm.props.children) == 'string') {
                        return elm
                    } else {
                        return React.cloneElement(elm, {
                            children: elm.props.children.map((e, i) => {
                                if (typeof(e) == 'string') {
                                    if (!e.match(/^[\r\n\s]*?$/gm)) { return e; }
                                } else {
                                    return filter(e)
                                }
                            }).filter((e, i) => nulls.indexOf(e) == -1)
                        })
                    }
                } else {
                    let tmp = elm.map((e, i) => filter(e)).filter((e, i) => nulls.indexOf(e) == -1)
                    tmp = tmp.map((e, i) => {
                        let children = filter(e.props.children)
                        try { children = children.filter((e, i) => nulls.indexOf(e) == -1) } catch (err) {}

                        return React.cloneElement(e,
                            {
                                key: i,
                                children: children
                            }
                        )
                    })
                    return tmp.length === 1 ? tmp[0] : tmp
                }
            }
        }

        schema = filter(schema)

        let size_divisor = 1.5
        this.setState({
            convert: {
                ...this.state.convert,
                popup: (
                    <PopoutWindow
                        title="HTML Schema"
                        center="screen"
                        options={{
                            width: (opt, win) => win.outerWidth / size_divisor,
                            height:(opt, win) => win.outerHeight / size_divisor,
                            top: (opt, win) => (win.innerHeight - opt.height(opt, win)) / size_divisor + win.screenY,
                            left: (opt, win) => (win.innerWidth - opt.width(opt, win)) / size_divisor + win.screenX
                        }}
                        onClosing={() => this.setState({ convert: { ...this.state.convert, popup: null } }) }
                    >
                        <div>
                            { theme }
                            { schema }
                        </div>
                    </PopoutWindow>
                )
            }
        })
    }

    jadn(maxHeight) {
        // <option value="{{ opt }}" {% if request.form['schema-list'] == opt %}selected=""{% endif %}>{{ opt }}</option>
        let schema_opts =  this.props.schemas.map((s, i) => <option key={ i } value={ s } >{ s }</option>)

        return (
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

                <Button color='secondary' onClick={ () => this.verifySchema() } className='float-right mr-2'>Verify</Button>

                <div className="form-row">
                    <div className="form-group col-md-5 px-1">
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
            </fieldset>
        )
    }

    converted(maxHeight) {
        let download = this.downloadConfig()

        // <option value="{{ options.convs[conv] }}" {% if request.form['convert-to'] == options.convs[conv] %}selected=""{% endif %}>{{ conv }}</option>
        let convert_opts =  Object.entries(this.props.conversions).map(([d, c], i) => <option key={ i } value={ c } >{ d }</option>)

        return (
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

                <div className={ "btn-group btn-group-sm float-right mr-2" + (this.state.convert.html ? '' : ' d-none') }>
                    <a className="btn btn-secondary" href="#" onClick={ this.viewPage.bind(this) }>View Page</a>
                    <a className="btn btn-secondary" href="#" onClick={ this.downloadPDF.bind(this) }>Download PDF</a>
                </div>

                { this.state.convert.popup }

                <div className="form-row ml-1">
                    <div className="form-group col-md-5 px-1">
                        <select id="convert-to" name="convert-to" className="form-control" default="empty" onChange={ (e) => this.setState({ convert: {...this.state.convert, selected: e.target.value } }) }>
                            <option value="empty">Convert To...</option>
                            { convert_opts }
                        </select>
                    </div>
                </div>
            </fieldset>
        )
    }

    render() {
        return (
            <DocumentMeta { ...this.meta } extend >
                <div className='row mx-auto'>
                    <Form className="mx-auto col-12" onSubmit={ this.submitForm.bind(this) }>
                        <div className="form-row">
                            { this.jadn() }

                            { this.converted() }
                        </div>

                        <div className="col-12"></div>

                        <div className="form-group">
                            <Button outline color="primary" type="submit" id="conv_tooltip">Convert</Button>
                            <Tooltip placement="bottom" isOpen={ this.state.conv_tooltip } target="conv_tooltip" toggle={ () => this.setState({ conv_tooltip: !this.state.conv_tooltip }) }>
                                Convert the given JADN schema to the selected format
                            </Tooltip>
                            <Button outline color="danger" type="reset" onClick={ () => { this.setState({ schema: {...this.state.schema, schema: {}, conv: '' }}) }} >Reset</Button>
                        </div>
                    </Form>
                </div>
            </DocumentMeta>
        )
    }
}

function mapStateToProps(state) {
    return {
        schemas: state.Convert.schemas || [],
        loadedSchemas: state.Util.loaded.schemas || [],
		validSchema: state.Validate.valid.schema || {},

        conversions: state.Convert.conversions || {},
        convertedSchema: state.Convert.converted || {},

		siteTitle: state.Util.site_title
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
