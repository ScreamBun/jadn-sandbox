import React, { ChangeEvent, Component, FormEvent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import {
  Button, ButtonGroup, Form, Tooltip
} from 'reactstrap';
import locale from 'react-json-editor/dist/locale/en';

import { SchemaJADN } from '../generate/schema/interface';
import {
  escaped2cbor, format, hexify, loadURL, minify, validURL
} from '../utils';
import JADNInput from '../utils/jadn-editor';
import { UtilActions, ValidateActions } from '../../actions';
import { RootState } from '../../reducers';

// Interface
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ValidatorProps {}

interface ValidatorState {
  valTooltip: boolean;
  verTooltip: boolean;
  message: {
    message: string;
    json: Record<string, any>;
    format: string;
    decode: string;
    selected: string;
    file: boolean;
    url: boolean;
    urlStr: string;
  };
  schema: {
    schema: SchemaJADN;
    selected: string;
    decodeTypes: {
      all: Array<string>;
      exports: Array<string>;
    };
    file: boolean;
    url: boolean;
    urlStr: string;
  };
}

type StateTypes = 'message'|'message-json'|'schema'

// Redux Connector
function mapStateToProps(state: RootState) {
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

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    info: () => dispatch(ValidateActions.info()),
    loadFile: (t: string, f: string) => dispatch(UtilActions.load(t, f)),
    validateSchema: (s: Record<string, any>) => dispatch(ValidateActions.validateSchema(s)),
    validateMessage: (s: Record<string, any>, m: Record<string, any>, t: string, f: string) => dispatch(ValidateActions.validateMessage(s, m, t, f))
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ValidatorConnectedProps = ValidatorProps & ConnectorProps;

// Component
class Validator extends Component<ValidatorConnectedProps, ValidatorState> {
  meta: {
    title: string;
    canonical: string;
  };

  schemaHeight = '40em';

  constructor(props: ValidatorConnectedProps) {
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
    info();
  }

  shouldComponentUpdate(nextProps: ValidatorConnectedProps, nextState: ValidatorState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  submitForm(e: FormEvent<HTMLFormElement>) {
    const { validMessage, validateMessage } = this.props;
    const { message, schema} = this.state;
    e.preventDefault();

    validateMessage(
      schema.schema,
      message.json,
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

  selectChange(e: ChangeEvent<HTMLSelectElement>) {
    const { id, value } = e.target;
    const type = id.split('-')[0] as 'message'|'schema';
    const updateArr: Record<string, any> = {
      selected: value,
      file: value === 'file',
      url: value === 'url'
    };

    if (value === 'empty' && type === 'message') {
      updateArr.format = '';
      updateArr.decode = '';
    }

    this.setState(prevState => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        ...updateArr
      }
    }), () => {
      // eslint-disable-next-line react/destructuring-assignment
      const { selected } = this.state[type];
      // eslint-disable-next-line react/destructuring-assignment
      const loaded = this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`];

      if (!['', 'empty', null, 'file', 'url'].includes(selected)) {
        const fmt: Record<string, any> = {};
        if (type === 'message') {
          // eslint-disable-next-line prefer-destructuring
          fmt.format = selected.split('.')[1];
        }
        if (!Object.keys(loaded).includes(selected)) {
          const { loadFile } = this.props;
          loadFile(`${type}s`, selected).then(() => {
            this.setState(prevState => ({
              ...prevState,
              [type]: {
                ...prevState[type],
                ...fmt,
                [type]: loaded[selected]
              }
            }), () => {
              if (type === 'schema') {
                this.loadDecodeTypes();
              }
            });
          });
        } else {
          this.setState(prevState => ({
            ...prevState,
            [type]: {
              ...prevState[type],
              [type]: loaded[selected]
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

  fileChange(e: ChangeEvent<HTMLInputElement>) {
    const { files, id } = e.target;
    const prefix = id.split('-')[0] as 'message'|'schema';
    const file = files[0];
    const type = file.name.split('.')[1];
    const fileReader = new FileReader();

    fileReader.onload = (fr: FileReader, _ev: ProgressEvent<FileReader>) => {
      let data = atob(fr.result.split(',')[1]);
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch (_err) {
        switch (type) {
          case 'cbor':
            data = escaped2cbor(hexify(data));
            break;
          // no default
        }
      }

      if (prefix === 'schema') {
        try {
          this.setState(prevState => ({
            schema: {
              ...prevState.schema,
              schema: JSON.parse(data)
            }
          }));
          this.loadDecodeTypes();
        } catch (_err) {
          toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING});
        }
      } else if (prefix === 'message') {
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

  format(t: StateTypes, i = 2) {
    const { message } = this.state;
    if (t === 'message' || t === 'message-json') {
      const fmt = t === 'message' ? message.format : 'json';
      let msg = t === 'message' ? message.message : JSON.stringify(message.json);
      msg = format(msg, fmt, i);

      if (msg.startsWith('Error')) {
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} ${msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }

      this.setState(prevState => ({ message: {...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
    } else if (t === 'schema') {
      try {
        this.setState(prevState => ({ schema: {...prevState.schema, schema: prevState.schema.schema }}));
      } catch (e) {
        const msg = `${t.charAt(0).toUpperCase()}${t.slice(1)} Invalid, cannot format: ${(e as Error).message}`;
        toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING});
      }
    }
  }

  minify(t: StateTypes) {
    const { message } = this.state;
    if (t === 'message' || t === 'message-json') {
      const fmt = t === 'message' ? message.format : 'json';
      let msg = t === 'message' ? message.message : JSON.stringify(message.json);
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
    // eslint-disable-next-line react/destructuring-assignment
    const { schema } = this.state.schema;
    let schemaObj = schema;
    if (typeof(schemaObj) === 'string') {
      try {
        schemaObj = JSON.parse(schemaObj);
      } catch (err) {
        toast(<p>{ (err as Error).message }</p>, {type: toast.TYPE.WARNING});
        return;
      }
    }

    const { validateSchema, validSchema } = this.props;
    validateSchema(schema).then(() => {
      const { valid_bool, valid_msg } = validSchema;
      toast(<p>{ valid_msg }</p>, {type: toast.TYPE[valid_bool ? 'INFO' : 'WARNING']});
    });
  }

  loadURL(t: 'message'|'schema') {
    // eslint-disable-next-line react/destructuring-assignment
    const { urlStr } = this.state[t];

    if (!validURL(urlStr)) {
      toast(<p>Invalid URL, cannot load from a non valid location</p>, {type: toast.TYPE.WARNING});
      return;
    }

    const file = urlStr.substring(urlStr.lastIndexOf('/') + 1);
    const fileExt = file.substring(file.lastIndexOf('.') + 1);

    if (['json', 'jadn'].indexOf(fileExt) === -1 && t === 'schema') {
      toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING});
      return;
    }

    loadURL(urlStr).then(data => {
      const d = data as Record<string, any>;
      this.setState(prevState => ({
        ...prevState,
        [t]: {
          ...prevState[t],
          [t]: d.data,
          format: fileExt === 'jadn' ? 'json' : d.fileExt
        }
      }));
      if (t === 'schema') {
        this.loadDecodeTypes();
      }
    }).catch(_err => {
      toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING});
    });
  }

  loadDecodeTypes() {
    const { message, schema } = this.state;
    const decodeTypes: {
      all: Array<string>;
      exports: Array<string>;
    } = {
      all: [],
      exports: []
    };
    let msgDecode = '';

    if (schema.schema.info !== undefined) {
      if (schema.schema.info.exports !== undefined) {
        decodeTypes.exports = schema.schema.info.exports;
      }
    }

    if (schema.schema.types !== undefined) {
      decodeTypes.all = schema.schema.types.map(def => def[0]);
      decodeTypes.all = decodeTypes.all.filter(dt => !decodeTypes.exports.includes(dt));
      decodeTypes.all.sort();
    }

    if (message.decode === '' || !decodeTypes.all.includes(message.decode)) {
      if (decodeTypes.exports.length >= 1) {
        // eslint-disable-next-line prefer-destructuring
        msgDecode = decodeTypes.exports[0];
      } else if (decodeTypes.all.length >= 1) {
        // eslint-disable-next-line prefer-destructuring
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
    const { schemas } = this.props;
    const { schema, verTooltip } = this.state;
    // list of options - <option value="{{ opt }}">{{ opt }}</option>
    const schemaOpts = schemas.map(s => <option key={ s } value={ s }>{ s }</option>);

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
                    <Tooltip placement="bottom" isOpen={ verTooltip } target="verTooltip" toggle={ () => this.setState(prevState => ({ verTooltip: !prevState.verTooltip })) }>
                      Validate the schema is valid prior to validating the message
                    </Tooltip>
                  </ButtonGroup>

                  <div className="col-sm-8 pl-0">
                    <div className="form-group col-md-6 mb-0 pr-0 pl-1 d-inline-block">
                      <select id="schema-list" name="schema-list" className="form-control" defaultValue="empty" onChange={ this.selectChange }>
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
                        <input type="text" className="form-control" defaultValue='' onChange={ e => this.setState(prevState => ({ schema: {...prevState.schema, urlStr: e.target.value }})) } />
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
    const { messages } = this.props;
    const { message, schema } = this.state;
    // list of options - <option value="{{ opt.name }}" decode="{{ opt.type }}">{{ opt.name }}</option>
    const msgOpts = Object.entries(messages).map(([n, t]) => <option key={ n } value={ n } data-decode={ t } >{ n }</option>);
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
                        <select id="message-list" name="message-list" className="form-control" defaultValue="empty" onChange={ this.selectChange }>
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
                          <input type="text" className="form-control" defaultValue='' onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, urlStr: e.target.value }})) } />
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
                      required
                      value={ message.message }
                      onChange={ e => this.setState(prevState => ({ message: {...prevState.message, message: e.target.value }})) }
                    />
                  </div>

                  <div className="card-footer">
                    <div className="float-left form-group col-md-6 pr-1 pl-1 mb-0">
                      <label className="control-label mb-1" htmlFor="message-format">Message Format</label>
                      <select className="form-control" id="message-format" name="message-format" required value={ message.format } onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, format: e.target.value }})) } >
                        <option value="">Message Format</option>
                        <option value="json">json</option>
                        <option value="cbor">cbor</option>
                        <option value="xml">xml</option>
                      </select>
                    </div>

                    <div className="float-left form-group col-md-6 pr-1 pl-1 mb-0">
                      <label className="control-label mb-1" htmlFor="message-decode">Message Type</label>
                      <select className="form-control" id="message-decode" name="message-decode" required value={ message.decode } onChange={ (e) => this.setState(prevState => ({ message: {...prevState.message, decode: e.target.value }})) }>
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
                      rows={ 10 }
                      value={ JSON.stringify(message.json) }
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

export default connector(Validator);
