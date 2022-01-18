import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  Button, ButtonGroup, Form, Tooltip
} from 'reactstrap';

import {
  escaped2cbor, format, hexify, loadURL, minify, validURL
} from '../utils';
import JADNInput from '../utils/jadn-editor';
import locale from 'react-json-editor/dist/locale/en';

import * as ValidateActions from '../../actions/validate';
import * as UtilActions from '../../actions/util';

function mapStateToProps(state) {
  return {
    messages: state.Validate.messages,
    loadedMessages: state.Util.loaded.messages || {},
    validMessage: state.Validate.valid.message || {},
    schemas: state.Validate.schemas,
    loadedSchemas: state.Util.loaded.schemas || {},
    validSchema: state.Validate.valid.schema || {},
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch) {
  return {
    info: () => dispatch(ValidateActions.info()),
    loadFile: (t, f) => dispatch(UtilActions.load(t, f)),
    validateSchema: (s) => dispatch(ValidateActions.validateSchema(s)),
    validateMessage: (s, d, t, f) => dispatch(ValidateActions.validateMessage(s, d, t, f))
  };
}

class Validator extends Component {
  constructor(props) {
    super(props);
    this.fileChange = this.fileChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.submitForm = this.submitForm.bind(this);

    this.state = {
      valTooltip: false,
      verTooltip: false,
      message: {
        message: '',
        json: {
          placeholder: 'Submit a message for validation to see the json version of the message'
        },
        format: '',
        decode: '',
        selected: 'empty',
        file: false,
        url: false,
        urlStr: ''
      },
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
        urlStr: ''
      }
    };

    const { info, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Validator`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.schemaHeight = '40em';
    info();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  submitForm(e) {
    const { validMessage, validateMessage } = this.props;
    const { message, schema} = this.state;
    e.preventDefault();

    validateMessage(
      schema.schema,
      message.message,
      message.format,
      message.decode
    ).then(() => {
      const { valid_bool, message_json, valid_msg } = validMessage;
      toast(<p>{ valid_msg }</p>, {type: toast.TYPE[valid_bool ? 'INFO' : 'WARNING']});

      this.setState(prevState => ({
        message: {
          ...prevState.message,
          json: message_json
        }
      }));
      this.format('message-json', 2);
    });

    return false;
  }

  selectChange(e) {
    const type = e.target.id.split('-')[0];
    let selected = e.target.value;
    const updateArr = {
      selected,
      file: selected === 'file',
      url: selected === 'url'
    };

    if (selected === 'empty' && type === 'message') {
      updateArr.format = '';
      updateArr.decode = '';
    }

    this.setState(prevState => ({
      [type]: {
        ...prevState[type],
        ...updateArr
      }
    }), () => {
      selected = this.state[type].selected;
      const loaded = this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`];

      if (!['', 'empty', null, 'file', 'url'].includes(selected)) {
        const fmt = {};
        if (type === 'message') {
          fmt.format = selected.split('.')[1];
        }
        if (!Object.keys(loaded).includes(selected)) {
          const { loadFile } = this.props;
          loadFile(`${type}s`, selected).then(() => {
            this.setState(prevState => ({
              [type]: {
                ...prevState[type],
                ...fmt,
                [type]: this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`][selected]
              }
            }), () => {
              if (type === 'schema') {
                this.loadDecodeTypes();
              }
            });
          });
        } else {
          this.setState(prevState => ({
            [type]: {
              ...prevState[type],
              [type]: this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`][selected]
            }
          }), () => {
            if (type === 'schema') {
              this.loadDecodeTypes();
            }
          });
        }
      }
    });
  }

  fileChange(e) {
    const id = e.target.id.split('-')[0];
    const file = e.target.files[0];
    const type = file.name.split('.')[1];
    const fileReader = new FileReader();

    fileReader.onload = (fr, pr) => {
      let data = atob(fileReader.result.split(',')[1]);
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch(e) {
        switch (type) {
          case 'cbor':
            data = escaped2cbor(hexify(data));
            break;
          // no deafult case
        }
      }

      if (id === 'schema') {
        try {
          this.setState(prevState => ({
            schema: {
              ...prevState.schema,
              schema: JSON.parse(data)
            }
          }));
          this.loadDecodeTypes();
        } catch (e) {
          toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING});
        }
      } else if (id === 'message') {
        this.setState(prevState => ({
            message: {
              ...prevState.message,
              format: type === 'jadn' ? 'json' : type,
              message: data
            }
        }));
      }
    };
    fileReader.readAsDataURL(file);
  }

  format(t) {
    const { message } = this.state;
    if (t === 'message' || t === 'message-json') {
      const fmt = t === 'message' ? message.format : 'json';
      let msg = t === 'message' ? message.message : message.json;
      msg = format(message, fmt, 2);

      if (msg.startsWith('Error')) {
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} ${msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }

      this.setState(prevState => ({ message: {...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
    } else if (t === 'schema') {
      try {
        this.setState(prevState => ({ schema: {...prevState.schema, schema: prevState.schema.schema }}));
      } catch (e) {
        const msg = `${t.charAt(0).toUpperCase()}${t.slice(1)} Invalid, cannot format: ${e.message}`;
        toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING});
      }
    }
  }

  minify(t) {
    const { message } = this.state;
    if (t === 'message' || t === 'message-json') {
      const fmt = t === 'message' ? message.format : 'json';
      let msg = t === 'message' ? message.message : message.json;
      msg = minify(msg, fmt);
      if (msg.startsWith('Error')) {
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} ${msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }
      this.setState(prevState => ({
        message: {
          ...prevState.message,
          [t === 'message' ? 'message' : 'json']: msg
        }
      }));
    } else if (t === 'schema') {
      try {
        this.setState(prevState => ({ schema: {...prevState.schema, schema: prevState.schema.schema }}));
      } catch (e) {
        const msg = `${t.charAt(0).toUpperCase()}${t.slice(1)} Invalid, cannot format: ${e.message}`;
        toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING});
      }
    }
  }

  verifySchema() {
    const { schema } = this.state.schema;
    let schemaObj = schema;
    if (typeof(schemaObj) === 'string') {
      try {
        schemaObj = JSON.parse(schema);
      } catch (err) {
        toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING});
        return;
      }
    }

    this.props.validateSchema(schema).then(() => {
      const { valid_bool, valid_msg } = this.props.validSchema;
      toast(<p>{ valid_msg }</p>, {type: toast.TYPE[valid_bool ? 'INFO' : 'WARNING']});
    });
  }

  loadURL(t) {
    const url = this.state[t].urlStr;

    if (!validURL(url)) {
      toast(<p>Invalid URL, cannot load from a non valid location</p>, {type: toast.TYPE.WARNING});
      return;
    }

    const file = url.substring(url.lastIndexOf('/') + 1);
    const fileExt = file.substring(file.lastIndexOf('.') + 1);

    if (['json', 'jadn'].indexOf(fileExt) === -1 && t === 'schema') {
      toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING});
      return;
    }

    loadURL(url).then(data => {
      this.setState(prevState => ({
        [t]: {
          ...prevState[t],
          [t]: data.data,
          format: fileExt === 'jadn' ? 'json' : data.fileExt
        }
      }));
      if (t === 'schema') {
        this.loadDecodeTypes();
      }
      return;
    }).catch(_err => {
      toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING});
    });
  }

  loadDecodeTypes() {
    const { message, schema } = this.state;
    const decodeTypes = {
      all: [],
      exports: []
    };
    let msgDecode = '';

    if (schema.schema.meta !== undefined) {
      if (schema.schema.meta.exports !== undefined) {
        decodeTypes.exports = schema.schema.meta.exports;
      }
    }

    if (schema.schema.types !== undefined) {
      decodeTypes.all = schema.schema.types.map(def => def[0]);
      decodeTypes.all = decodeTypes.all.filter(dt => !decodeTypes.exports.includes(dt));
      decodeTypes.all.sort();
    }

    if (message.decode === '' || !decodeTypes.all.includes(message.decode)) {
      if (decodeTypes.exports.length >= 1) {
        msgDecode = decodeTypes.exports[0];
      } else if (decodeTypes.all.length >= 1) {
        msgDecode = decodeTypes.all[0];
      }
    }

    this.setState(prevState => ({
      message: {
        ...prevState.message,
        decode: msgDecode
      },
      schema: {
        ...prevState.schema,
        decodeTypes
      }
    }));
  }

  jadn() {
    const { schema } = this.state;
    // list of options - <option value="{{ opt }}">{{ opt }}</option>
    const schemaOpts = this.props.schemas.map(s => <option key={ s } value={ s }>{ s }</option>);

    return (
      <fieldset className="col-6 p-0 float-left">
        <legend>JADN Schema</legend>
        <div className="form-row">
          <div className="col-md-12 mb-3">
            <div id="schema-card" className="tab-pane fade active show">
              <div className="card">
                <div className="card-header">
                  <ButtonGroup className="float-right">
                    <Button color="info" size="sm" onClick={ () => this.verifySchema() } id="verTooltip" >Verify</Button>
                    <Tooltip placement="bottom" isOpen={ this.state.verTooltip } target="verTooltip" toggle={ () => this.setState(prevState => ({ verTooltip: !prevState.verTooltip })) }>
                      Validate the schema is valid prior to validating the message
                    </Tooltip>
                  </ButtonGroup>

                  <div className="col-sm-8 pl-0">
                    <div className="form-group col-md-6 mb-0 pr-0 pl-1 d-inline-block">
                      <select id="schema-list" name="schema-list" className="form-control" default="empty" onChange={ this.selectChange }>
                        <option value="empty">Schema</option>
                        <optgroup label="Testers">
                          { schemaOpts }
                        </optgroup>
                        <optgroup label="Custom">
                          <option value="file">File...</option>
                          <option value="url">URL...</option>
                        </optgroup>
                      </select>
                    </div>

                    <div id="schema-file-group" className={ `form-group col-md-6 px-1${schema.file ? ' d-inline-block' : ' d-none'}` } >
                      <input type="file" className="btn btn-light form-control-file" id="schema-file" name="schema-file" accept=".jadn" onChange={ this.fileChange } />
                    </div>

                    <div id="schema-url-group" className={ `form-group col-md-6 px-1${schema.url ? ' d-inline-block' : ' d-none'}` }>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <Button color="info" onClick={ () => this.loadURL('schema') }>Load URL</Button>
                        </div>
                        <input type="text" className="form-control" default='' onChange={ e => this.setState(prevState => ({ schema: {...prevState.schema, urlStr: e.target.value }})) } />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-control border card-body p-0" style={{ height: this.schemaHeight }}>
                  <JADNInput
                    id='jadn_schema'
                    placeholder={ schema.schema }
                    onChange={
                      val => {
                        if (val.jsObject) {
                          this.setState(prevState => ({
                            schema: {
                              ...prevState.schema,
                              schema: val.jsObject
                            }
                          }));
                        }
                      }
                    }
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
        </div>
      </fieldset>
    );
  }

  message() {
    const { message, schema } = this.state;
    // list of options - <option value="{{ opt.name }}" decode="{{ opt.type }}">{{ opt.name }}</option>
    const msgOpts = Object.entries(this.props.messages).map(([n, t]) => <option key={ n } value={ n } decode={ t } >{ n }</option>);
    const decodeExports = schema.decodeTypes.exports.map(dt => <option key={ dt } value={ dt } >{ dt }</option>);
    const decodeAll = schema.decodeTypes.all.map(dt => <option key={ dt } value={ dt } >{ dt }</option>);

    if (typeof(message.message) !== 'string') {
      setTimeout(() => this.format('message'), 5);
    }

    return (
      <fieldset>
        <legend>Message</legend>
        <div className="form-row">
          <div className="col-md-12 mb-3">
            <ul className={ `nav nav-tabs${message.json.placeholder ? ' d-none' : ''}` }>
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
                    <ButtonGroup className="float-right" size="sm">
                      <Button color="info" onClick={ () => this.format('message') }>Format</Button>
                      <Button color="info" onClick={ () => this.minify('message') }>Minify</Button>
                    </ButtonGroup>

                    <div className="col-sm-8 pl-0">
                      <div className="form-group col-md-6 mb-0 pr-0 pl-1 d-inline-block">
                        <select id="message-list" name="message-list" className="form-control" default="empty" onChange={ this.selectChange }>
                          <option value="empty">Message</option>
                          <optgroup label="Testers">
                            { msgOpts }
                          </optgroup>
                          <optgroup label="Custom">
                            <option value="file">File...</option>
                            <option value="url">URL...</option>
                          </optgroup>
                        </select>
                      </div>

                      <div id="message-file-group" className={ `form-group col-md-6 px-1${message.file ? ' d-inline-block' : ' d-none'}` }>
                        <input type="file" className="btn btn-light form-control-file" id="message-file" name="message-file" accept=".json,.jadn,.xml,.cbor" onChange={ this.fileChange } />
                      </div>

                      <div id="message-url-group" className={ `form-group col-md-6 px-1${message.url ? ' d-inline-block' : ' d-none'}` }>
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <Button color="info" onClick={ () => this.loadURL('message') }>Load URL</Button>
                          </div>
                          <input type="text" className="form-control" default='' onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, urlStr: e.target.value }})) } />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-control border card-body p-0" style={{ height: this.schemaHeight }}>
                    <textarea
                      placeholder="Paste message to be validated here"
                      style={{
                        resize: 'none',
                        outline: 'none',
                        width: '100%',
                        padding: '10px',
                        border: 'none',
                        height: '100%'
                      }}
                      required=""
                      value={ message.message }
                      onChange={ e => this.setState(prevState => ({ message: {...prevState.message, message: e.target.value }})) }
                    />
                  </div>

                  <div className="card-footer">
                    <div className="float-left form-group col-md-6 pr-1 pl-1 mb-0">
                      <label className="control-label mb-1" htmlFor="message-format">Message Format</label>
                      <select className="form-control" id="message-format" name="message-format" required="" value={ message.format } onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, format: e.target.value }})) } >
                        <option value="">Message Format</option>
                        <option value="json">json</option>
                        <option value="cbor">cbor</option>
                        <option value="xml">xml</option>
                      </select>
                    </div>

                    <div className="float-left form-group col-md-6 pr-1 pl-1 mb-0">
                      <label className="control-label mb-1" htmlFor="message-decode">Message Type</label>
                      <select className="form-control" id="message-decode" name="message-decode" required="" value={ message.decode } onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, decode: e.target.value }})) }>
                        <optgroup label="Exports">
                          { decodeExports }
                        </optgroup>
                        <optgroup label="All">
                          { decodeAll }
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div id="json-card" className="tab-pane fade">
                <div className="card">
                  <div className="card-header">
                    <ButtonGroup className="float-right">
                      <Button outline color="secondary" onClick={ () => this.format('message-json', 2) }>Verbose</Button>
                      <Button outline color="secondary" onClick={ () => this.minify('message-json') }>Minify</Button>
                    </ButtonGroup>
                  </div>

                  <div className="form-control border card-body p-0" style={{ height: this.schemaHeight }}>
                    <textarea
                      placeholder={ JSON.stringify(message.json) }
                      style={{
                        resize: 'none',
                        outline: 'none',
                        width: '100%',
                        padding: '10px',
                        border: 'none',
                        height: '100%'
                      }}
                      id="message-json"
                      rows="10"
                      value={ message.json }
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    );
  }

  render() {
    const { valTooltip } = this.state;
    const { canonical, title } = this.meta;
    return (
      <div className='row mx-auto'>
        <Helmet>
          <title>{ title }</title>
          <link rel="canonical" href={ canonical } />
        </Helmet>
        <Form className="mx-auto col-12 position-relative" onSubmit={ this.submitForm }>
          <div className="form-group position-absolute" style={{ right: '1.25em', zIndex: 100 }}>
            <Button outline color="primary" id="valTooltip">Validate</Button>
            <Tooltip placement="bottom" isOpen={ valTooltip } target="valTooltip" toggle={ () => this.setState(prevState => ({ valTooltip: !prevState.valTooltip })) }>
              Validate the message against the given schema
            </Tooltip>
            <Button outline color="danger" type="reset">Reset</Button>
          </div>
          { this.jadn() }
          { this.message() }
        </Form>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Validator);
