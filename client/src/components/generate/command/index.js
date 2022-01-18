import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import JSONPretty from 'react-json-pretty';
import {
  Button, ButtonGroup, Form, FormGroup, Input, FormText, Tooltip
} from 'reactstrap';

import { Field, delMultiKey, setMultiKey } from './lib';
import {
  escaped2cbor, hexify, loadURL, validURL
} from '../../utils';
import JADNInput from '../../utils/jadn-editor';
import locale from 'react-json-editor/dist/locale/en';
import * as ValidateActions from '../../../actions/validate';
import * as UtilActions from '../../../actions/util';
import * as GenActions from '../../../actions/generate';


function mapStateToProps(state) {
  return {
    schemas: state.Generate.schemas,
    loadedSchemas: state.Util.loaded.schemas || {},
    validSchema: state.Validate.valid.schema || {},
    selectedSchema: state.Generate.selectedSchema,
    message: state.Generate.message,
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch) {
  return {
    info: () => dispatch(GenActions.info()),
    loadFile: (t, f) => dispatch(UtilActions.load(t, f)),
    validateSchema: (s) => dispatch(ValidateActions.validateSchema(s)),
    setSchema: (schema) => dispatch(GenActions.setSchema(schema))
  };
}

class Generate extends Component {
  constructor(props) {
    super(props);
    this.fileChange = this.fileChange.bind(this);
    this.optChange = this.optChange.bind(this);
    this.selectChange = this.selectChange.bind(this);

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
    };

    const { info, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Creator-Message`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    info();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    const { schema } = this.state;
    if (schema.schema !== nextState.schema.schema) {
      const { setSchema } = this.props;
      setSchema(nextState.schema.schema);
      nextState.message = {};
    }

    return propsUpdate || stateUpdate;
  }

  makeID() {
    console.log('Make ID');
    this.setState(prevState => ({
      message: {
        ...prevState.message,
        id: this.genUUID()
      }
    }));
  }

  validUUID(uuid) {
    if (!uuid) {
      return false;
    }

    const pattern = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/;
    return uuid.match(pattern);
  }

  genUUID() {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
    });
  }

  optChange(k, v) {
    this.setState(prevState => {
      const msg = prevState.message || {};
      const keys = k.split('.');
      if (keys.length > 1 && msg[keys[0]] && !msg[keys[0]][keys[1]]) {
        delMultiKey(msg, keys[0]);
      }

      if (!['', ' ', null, undefined, [], {}].includes(v)) {
        setMultiKey(msg, k, v);
      } else {
        delMultiKey(msg, k);
      }

      return {
        message: msg
      };
    });
  }

  selectChange(e) {
    const {id, value } = e.target;
    const type = id.split('-')[0];
    const updateArr = {
      selected: value,
      file: value === 'file',
      url: value === 'url'
    };

    if (value === 'empty' && type === 'message') {
      updateArr.format = '';
      updateArr.decode = '';
    }

    this.setState(prevState => ({
      [type]: {
        ...prevState[type],
        ...updateArr
      }
    }), () => {
      const loaded = this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`];
      const { selected } = this.state[type];

      if (!['', 'empty', null, 'file', 'url'].includes(selected)) {
        const format = {};
        if (type === 'message') {
          format.format = selected.split('.')[1];
        }

        if (!Object.keys(loaded).includes(selected)) {
          this.props.loadFile(`${type}s`, selected).then(() => {
            this.setState(prevState => ({
              [type]: {
                ...prevState[type],
                ...format,
                [type]: this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`][selected]
              }
            }));
          });
        }
      } else {
        this.setState(prevState => ({
          [type]: {
            ...prevState[type],
            [type]: this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`][value]
          }
        }));
      }
    });
  }

  fileChange(e) {
    const { id, files } = e.target;
    const prefix = id.split('-')[0];
    const [ file ] = files;
    const type = file.name.split('.')[1];
    const fileReader = new FileReader();

    fileReader.onload = (_fr, _ev) => {
      let data = atob(fileReader.result.split(',')[1]);
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch (_err) {
        switch (type) {
          case 'cbor':
            data = escaped2cbor(hexify(data));
            break;
          // no default case
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

  loadURL(t) {
    const { url_str } = this.state[t];

    if (!validURL(url_str)) {
      toast(<p>Invalid URL, cannot load from a non valid location</p>, {type: toast.TYPE.WARNING});
      return;
    }

    const file = url_str.substring(url_str.lastIndexOf('/') + 1);
    const fileExt = file.substring(file.lastIndexOf('.') + 1);

    if (!['json', 'jadn'].includes(fileExt) && t === 'schema') {
      toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING});
      return;
    }

    loadURL(url_str).then((data) => {
      this.setState(prevState => ({[t]: {...prevState[t], [t]: data.data, format: fileExt === 'jadn' ? 'json' : data.fileExt }}));
    }).catch(_err => {
      toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING});
    });
  }

  verifySchema() {
    const { schema } = this.state;
    let schemaObj = schema.schema;
    if (typeof(schema.schema) === 'string') {
      try {
        schemaObj = JSON.parse(schema);
      } catch (err) {
        toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING});
        return;
      }
    }
    const { validSchema, validateSchema } = this.props;
    validateSchema(schemaObj).then(() => {
      const { valid_bool, valid_msg } = validSchema;
      toast(<p>{ valid_msg }</p>, {type: toast.TYPE[valid_bool ? 'INFO' : 'WARNING']});
    });
  }

  cmdCreator(maxHeight) {
    const { selectedSchema } = this.props;
    const { command_record, message } = this.state;
    const exportRecords = selectedSchema && selectedSchema.meta ? selectedSchema.meta.exports : [];
    let recordDef = selectedSchema.hasOwnProperty('types') ? selectedSchema.types.filter(type => type[0] === command_record) : [];
    recordDef = (recordDef.length === 1 ? recordDef[0] : []);
    let commandFields = '';
    if (recordDef.length > 1 && recordDef[recordDef.length - 2].length > 0) {
      commandFields = (
        <FormText color="muted">
          <b>Comment: </b>
          { recordDef[recordDef.length - 2] }
        </FormText>
      );
     }

    let fieldDefs = '';
    if (recordDef[recordDef.length - 1] === undefined) {
      fieldDefs = (
        <FormText color="muted">
          Command Fields will appear here after selecting a type
          &nbsp;
          { command_record }
        </FormText>
      );
    } else {
      fieldDefs = recordDef[recordDef.length - 1].map((def, i) => <Field key={ i } def={ def } optChange={ this.optChange } />);
    }

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
                  <Input type='select' name='command-list' id='command-list' className='form-control' default='' onChange={ e => { this.setState({'command_record': e.target.value, message: {}}); } }>
                    <option value=''>Command Type</option>
                    { exportRecords.map(rec => <option key={ rec } value={ rec }>{ rec }</option>) }
                  </Input>
                </FormGroup>
                {/* <Button color='primary' className='float-right' onClick={ () => this.makeID() }>Generate ID</Button> */}
              </div>

              <Form id='command-fields' className='card-body' onSubmit={ () => { return false; } } style={{ height: `${maxHeight-25}px`, overflowY: 'scroll' }}>
                { commandFields }
                <div id="fieldDefs">
                  { fieldDefs }
                </div>
              </Form>
            </div>
          </div>

          <div className='tab-pane fade position-relative' id='tab-message' style={{ height: `${maxHeight}px` }}>
            <JSONPretty
              id='message'
              className='scroll-xl border'
              style={{ minHeight: '2.5em' }}
              json={ message }
            />
          </div>
        </div>
      </div>
    );
  }

  schema(maxHeight) {
    const { schemas } = this.props;
    const { schema, ver_tooltip } = this.state;
    // list of options - <option value="{{ opt }}">{{ opt }}</option>
    const schemaOpts = schemas.map((s, i) => <option key={ i } value={ s }>{ s }</option>);

    return (
      <div className='col-md-6'>
        <div id="schema-card" className="tab-pane fade active show">
          <div className="card">
            <div className="card-header">
              <ButtonGroup className="float-right">
                <Button outline color="secondary" onClick={ () => this.verifySchema() } id="ver_tooltip" >Verify</Button>
                <Tooltip placement="bottom" isOpen={ ver_tooltip } target="ver_tooltip" toggle={ () => this.setState(prevState => ({ ver_tooltip: !prevState.ver_tooltip })) }>
                  Validate the schema is valid prior to validating the message
                </Tooltip>
              </ButtonGroup>

              <div className="col-sm-10 pl-0">
                <div className="form-group col-md-6 pr-0 pl-1 d-inline-block">
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
                    <input type="text" className="form-control" default='' onChange={ e => this.setState(prevState => ({ schema: {...prevState.schema, url_str: e.target.value }})) } />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-control border card-body p-0" style={{ height: `${maxHeight}px` }}>
              <JADNInput
                id='jadn_schema'
                placeholder={ schema.schema }
                onChange={
                  val => {
                    if (val.jsObject) {
                      this.setState(prevState => ({ schema: {...prevState.schema, schema: val.jsObject }}));
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
    );
  }

  render() {
    const { canonical, title } = this.meta;
    const maxHeight = window.innerHeight-225;

    return (
      <div className='row mx-auto'>
        <Helmet>
          <title>{ title }</title>
          <link rel="canonical" href={ canonical } />
        </Helmet>
        { this.schema(maxHeight) }
        <div className='col-12 m-2 d-md-none' />
        { this.cmdCreator(maxHeight) }
        <div className='col-12' style={{ height: '1.25em' }} />
        <div id='cmd-status' className='modal'>
          <div className='modal-dialog h-100 d-flex flex-column justify-content-center my-0' role='document'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>
                  Command:
                  &nbsp;
                  <span />
                </h5>
                <button type='button' className='close' data-dismiss='modal' aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>

              <div className='modal-body'>
                <p className='cmd-details'>
                  <b>Details:</b>
                  &nbsp;
                  <span />
                </p>
                <p className='mb-1'>
                  <b>Command:</b>
                </p>
                <pre className='border code command' />
                <p className='mb-1'>
                  <b>Responses:</b>
                </p>
                <div className='p-1 border border-primary responses' />
              </div>

              <div className='modal-footer'>
                <button type='button' className='btn btn-secondary' data-dismiss='modal'>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Generate);
