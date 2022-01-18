import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import PopoutWindow from 'react-popout';
import FileSaver from 'file-saver';
import ToggleButton from 'react-toggle-button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck, faFileDownload, faFilePdf, faTimes, faWindowMaximize
} from '@fortawesome/free-solid-svg-icons';
import { Button, Form, Tooltip } from 'reactstrap';

import {
  escaped2cbor, format, hexify, loadURL, minify, validURL
} from '../utils';
import JSONInput from '../utils/jadn-editor';
import locale from 'react-json-editor/dist/locale/en';
import * as ConvertActions from '../../actions/convert';
import * as ValidateActions from '../../actions/validate';
import * as UtilActions from '../../actions/util';

const parser = require('html-react-parser');

function mapStateToProps(state) {
  return {
    schemas: state.Convert.schemas || [],
    loadedSchemas: state.Util.loaded.schemas || [],
    validSchema: state.Validate.valid.schema || {},
    conversions: state.Convert.conversions || {},
    convertedSchema: state.Convert.converted || {},
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch) {
  return {
    info: () => dispatch(ConvertActions.info()),
    convertSchema: (s, t, c) => dispatch(ConvertActions.convertSchema(s, t, c)),
    loadFile: (t, f) => dispatch(UtilActions.load(t, f)),
    validateSchema: (s) => dispatch(ValidateActions.validateSchema(s))
  };
}

class Converter extends Component {
  download_mime = {
    proto3: 'text/x-c',
    rng: 'application/xml',
    html: 'text/html',
    md: 'text/plain',
    cddl: 'text/plain',
    thrift: 'text/plain'
  }

  constructor(props) {
    super(props);
    this.downloadPDF = this.downloadPDF.bind(this);
    this.fileChange = this.fileChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.viewPage = this.viewPage.bind(this);

    this.state = {
      convTooltip: false,
      convertDownloadTooltip: false,
      pdfDownloadTooltip: false,
      viewSchemaTooltip: false,
      schemaOptsDropdown: false,
      message: {
        data: '',
        format: '',
        json: {},
        message: ''
      },
      schema: {
        schema: {
          placeholder: 'Paste JADN schema here'
        },
        selected: 'empty',
        comments: true,
        file: false,
        url: false,
        urlStr: ''
      },
      convert: {
        selected: 'empty',
        html: false,
        popup: null
      }
    };

    const { info, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Convert`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    this.schema_height = '40em';
    info();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  submitForm(e) {
    const { convertSchema, validSchema,  validateSchema} = this.props;
    const { convert, schema } = this.state;
    e.preventDefault();

    let schemaObj = schema.schema;
    if (typeof(schema.schema) === 'string') {
      try {
        schemaObj = JSON.parse(schema);
      } catch (err) {
        toast(<p>{ err.message }</p>, {type: toast.TYPE.WARNING});
        return false;
      }
    }

    validateSchema(schemaObj).then(() => {
      if (validSchema.valid_bool) {
        convertSchema(
          schema.schema,
          convert.selected,
          schema.comments ? 'all' : 'none'
        );
      } else {
        toast(<p>{ validSchema.valid_msg }</p>, {type: toast.TYPE[validSchema.valid_bool ? 'INFO' : 'WARNING']});
      }
    });

    return false;
  }

  selectChange(e) {
    const { id, value } = e.target;
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
      const selected = this.state[type].selected;

      if (!['', 'empty', null, 'file', 'url'].includes(selected)) {
        let format = {};
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
        } else {
          this.setState(prevState => ({
            [type]: {
              ...prevState[type],
              [type]: this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`][selected]
            }
          }));
        }
      }
    });
  }

  fileChange(e) {
    const { files, id } = e.target;
    const [ file ] = files;
    const prefix = id.split('-')[0];
    const type = file.name.split('.')[1];
    const fileReader = new FileReader();

    fileReader.onload = (_fr, _ev) => {
      let data = atob(fileReader.result.split(',')[1]);
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch (e) {
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
        } catch (e) {
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

  format(t, ind=2) {
    const { message } = this.state;
    if (t === 'message' || t === 'message-json') {
      const fmt = t === 'message' ? message.format : 'json';
      const  msg = format(t === 'message' ? message.message : message.json, fmt, 2);

      if (msg.startsWith('Error')) {
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} ${msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }

      this.setState(prevState => ({ message: { ...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
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
      const msg = minify(t === 'message' ? message.message : message.json, fmt);

      if (msg.startsWith('Error')) {
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} {msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }
      this.setState(prevState => ({ message: {...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
    } else if (t === 'schema') {
      try {
        this.setState(prevState => ({ schema: {...prevState.schema, schema: prevState.schema.schema }}));
      } catch (e) {
        const msg = `${t.charAt(0).toUpperCase() + t.slice(1)} Invalid, cannot format: ${e.message}`;
        toast(<p>{ msg }</p>, {type: toast.TYPE.WARNING});
      }
    }
  }

  verifySchema() {
    const { validSchema, validateSchema } = this.props;
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

    validateSchema(schemaObj).then(() => {
      const { valid_bool, valid_msg } = validSchema;
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

    if (!['json', 'jadn'].includes(fileExt) && t === 'schema') {
      toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING});
      return;
    }

    loadURL(url).then((data) => {
      this.setState(prevState => ({[t]: {...prevState[t], [t]: data.data, format: fileExt === 'jadn' ? 'json' : data.fileExt }}));
    }).catch(_err => {
      toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING});
    });
  }

  downloadConfig() {
    const { convertedSchema } = this.props;
    const { convert } = this.state;
    const rtn = {
      content: '',
      file: ''
    };

    if (convertedSchema.convert) {
      const schema = convertedSchema.convert;
      const fmt = convertedSchema.fmt;
      rtn.file = `schema.${fmt}`;

      switch (fmt) {
        case 'jadn': // application/json
          rtn.content = `data:application/json;charset=utf-8,${encodeURIComponent(schema)}`;
          break;
        case 'proto3': // text/x-c
        case 'rng': // application/xml
        case 'html': // text/html
        case 'md': // text/plain
        case 'cddl': // text/plain
        case 'thrift': // text/plain
          rtn.content = `data:${this.download_mime[fmt]};charset=utf-8,${encodeURIComponent(schema)}`;
          break;
        default:
          rtn.content = `data:text/plain;charset=utf-8,${encodeURIComponent('Theres some issues....')}`;
          break;
      }

      if (fmt === 'html' && convert.html === false) {
        setTimeout(() => this.setState(prevState => ({
          convert: {
            ...prevState.convert,
            html: true
          }
        })), 100);
      } else if (fmt !== 'html' && convert.html !== false) {
        setTimeout(() => this.setState(prevState => ({
          convert: {
            ...prevState.convert,
            html: false
          }
        })), 100);
      }
    }
    return rtn;
  }

  downloadPDF(e) {
    const { schema } = this.state;
    e.preventDefault();

    fetch('/api/convert/pdf', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schema: schema.schema
      })
    }).then(
      rsp => rsp.blob()
    ).then(data => {
      FileSaver.saveAs(data, 'schema.pdf');
    }).catch(err => {
      console.log(err);
    });
  }

  viewPage(e) {
    const { convertedSchema } = this.props;
    e.preventDefault();
    const nulls = ['', ' ', null, undefined];
    const htmlTmp = parser(convertedSchema.convert.replace(/^\s+/gm, '').replace(/\s+$/gm, ''));

    // CSS Theme
    let theme = htmlTmp.props.children.filter((c) => c.type === 'head');
    theme = (theme.length === 1 ? theme[0].props.children : []).filter(e => nulls.indexOf(e) === -1);
    theme = theme.filter(e => e.type === 'style');
    theme = theme.length === 1 ? theme[0] : {};

    // HTML Schema
    let schema = htmlTmp.props.children.filter((c) => c.type === 'body');
    schema = schema.length === 1 ? schema[0].props.children : [];

    // Remove whitespace - non objects
    const filter = elm => {
      if (typeof(elm) === 'string') {
        return (!elm || elm.match(/^[\r\n\s]*?$/m) ? '' : elm);
      }
      if (elm.props && elm.props.children) {
        if (typeof(elm.props.children) === 'string') {
          return elm;
        }
        return React.cloneElement(elm, {
          children: elm.props.children.map(e => {
            if (typeof(e) === 'string' && !e.match(/^[\r\n\s]*?$/gm)) {
              return e;
            }
            return filter(e);
          }).filter(e => !nulls.includes(e))
        });
      }
      let tmp = elm.map(e => filter(e)).filter(e => !nulls.includes(e));
      tmp = tmp.map((e, i) => {
        let children = filter(e.props.children);
        try {
          children = children.filter(e => !nulls.includes(e));
        } catch (err) {
          console.log(err);
        }
        return React.cloneElement(e, {
          key: i,
          children
        });
      });
      return tmp.length === 1 ? tmp[0] : tmp;
    };

    const sizeDivisor = 1.5;
    schema = filter(schema);
    this.setState(prevState => ({
      convert: {
        ...prevState.convert,
        popup: (
          <PopoutWindow
            title="HTML Schema"
            center="screen"
            options={
              {
                width: (_opt, win) => win.outerWidth / sizeDivisor,
                height:(_opt, win) => win.outerHeight / sizeDivisor,
                top: (opt, win) => (win.innerHeight - opt.height(opt, win)) / sizeDivisor + win.screenY,
                left: (opt, win) => (win.innerWidth - opt.width(opt, win)) / sizeDivisor + win.screenX
              }
            }
            onClosing={ () => this.setState(prevState1 => ({ convert: { ...prevState1.convert, popup: null } })) }
          >
            <div>
              { theme }
              { schema }
            </div>
          </PopoutWindow>
        )
      }
    }));
  }

  jadn() {
    const { schemas } = this.props;
    const { schema } = this.state;
    // <option value="{{ opt }}" {% if request.form['schema-list'] === opt %}selected=""{% endif %}>{{ opt }}</option>
    let schemaOpts =  schemas.map(s=> <option key={ s } value={ s } >{ s }</option>);

    return (
      <fieldset className="col-6 p-0 float-left">
        <legend>JADN Schema</legend>
        <div className="card">
          <div className="form-control border card-body p-0" style={{ height: this.schema_height }}>
            <JSONInput
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

          <div className="card-footer pb-3">
            <Button color='secondary' onClick={ () => this.verifySchema() } className='float-right mr-2'>Verify</Button>
            <div className="form-row">
              <div className="form-group col-md-5 px-1 mb-0">
                <select id="schema-list" name="schema-list" className="form-control mb-0" default="empty" onChange={ this.selectChange }>
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

              <div id="schema-file-group" className={ `form-group col-md-6 px-1 mb-0${schema.file ? '' : ' d-none'}` } >
                <input type="file" className="btn btn-light form-control-file" id="schema-file" name="schema-file" accept=".jadn" onChange={ this.fileChange } />
              </div>

              <div id="schema-url-group" className={ `form-group col-md-6 px-1 mb-0${schema.url ? '' : ' d-none'}` }>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <Button color="info" onClick={ () => this.loadURL('schema') }>Load URL</Button>
                  </div>
                  <input type="text" className="form-control" default='' onChange={ (e) => this.setState(prevState => ({ schema: {...prevState.schema, urlStr: e.target.value }})) } />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 m-1" />
      </fieldset>
    );
  }

  converted() {
    const { conversions, convertedSchema } = this.props;
    const {
      convert, convertDownloadTooltip, pdfDownloadTooltip, schema, viewSchemaTooltip
    } = this.state;
    const download = this.downloadConfig();

    // <option value="{{ options.convs[conv] }}" {% if request.form['convert-to'] === options.convs[conv] %}selected=""{% endif %}>{{ conv }}</option>
    const convertOpts =  Object.entries(conversions).map(([d, c], i) => <option key={ i } value={ c } >{ d }</option>);

    return (
      <fieldset className="col-6 p-0 float-left">
        <legend>Converted Schema</legend>
        <div className="card">
          <div className="form-control card-body p-0" style={{ height: this.schema_height }}>
            <textarea
              placeholder="Converted JADN schema"
              style={{
                resize: 'none',
                outline: 'none',
                width: '100%',
                padding: '10px',
                border: 'none',
                height: '100%'
              }}
              value={ convertedSchema.convert || '' }
              readOnly
            />
          </div>

          <div className='card-footer'>
            <a id='convertDownloadTooltip' className={ `btn btn-sm btn-primary float-right${convertedSchema.convert ? '' : ' disabled'}` } href={ download.content } download={ download.file } target="_blank" rel="noreferrer">
              <FontAwesomeIcon icon={ faFileDownload } size='2x' />
            </a>
            <Tooltip placement="bottom" isOpen={ convertDownloadTooltip } target="convertDownloadTooltip" toggle={ () => this.setState(prevState => ({ convertDownloadTooltip: !prevState.convertDownloadTooltip })) }>
              Download converted schema
            </Tooltip>

            <div className={ `btn-group btn-group-sm float-right mr-2${convert.html ? '' : ' d-none'}` }>
              <a id="viewSchemaTooltip" className="btn btn-info" href="#" onClick={ this.viewPage }>
                <FontAwesomeIcon icon={ faWindowMaximize } size='2x' />
              </a>
              <Tooltip placement="bottom" isOpen={ viewSchemaTooltip } target="viewSchemaTooltip" toggle={ () => this.setState(prevState => ({ viewSchemaTooltip: !prevState.viewSchemaTooltip })) }>
                View Schema in new window
              </Tooltip>

              <a id="pdfDownloadTooltip" className="btn btn-info" href="#" onClick={ this.downloadPDF }>
                <FontAwesomeIcon icon={ faFilePdf } size='2x' />
              </a>
              <Tooltip placement="bottom" isOpen={ pdfDownloadTooltip } target="pdfDownloadTooltip" toggle={ () => this.setState(prevState => ({ pdfDownloadTooltip: !prevState.pdfDownloadTooltip })) }>
                Download PDF of the schema
              </Tooltip>
            </div>
            { convert.popup }
            <div className="form-row ml-1 mb-0">
              <div className="form-group col-md-6 px-1 mb-0">
                <select id="convert-to" name="convert-to" className="form-control" default="empty" onChange={ e => this.setState(prevState => ({ convert: { ...prevState.convert, selected: e.target.value } })) }>
                  <option value="empty">Convert To...</option>
                  { convertOpts }
                </select>
              </div>
              <div className="form-check">
                <label className="form-check-label" htmlFor="comments">Comments</label>
                <ToggleButton
                  id="comments"
                  className="form-check-input"
                  inactiveLabel={ <FontAwesomeIcon icon={ faTimes } /> }
                  activeLabel={ <FontAwesomeIcon icon={ faCheck } /> }
                  value={ schema.comments }
                  onToggle={
                    val => {
                      this.setState(prevState => ({
                        schema: {
                          ...prevState.schema,
                          comments: !val
                        }
                      }));
                    }
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 m-1" />
      </fieldset>
    );
  }

  render() {
    const { convTooltip } = this.state;
    const { canonical, title } = this.meta;
    return (
      <div className='row mx-auto'>
        <Helmet>
          <title>{ title }</title>
          <link rel="canonical" href={ canonical } />
        </Helmet>
        <Form className="mx-auto col-12" onSubmit={ this.submitForm }>
          <div className="form-row">
            { this.jadn() }
            { this.converted() }
          </div>
          <div className="col-12" />
          <div className="form-group">
            <Button outline color="primary" type="submit" id="convTooltip">Convert</Button>
            <Tooltip placement="bottom" isOpen={ convTooltip } target="convTooltip" toggle={ () => this.setState(prevState => ({ convTooltip: !prevState.convTooltip })) }>
              Convert the given JADN schema to the selected format
            </Tooltip>
            <Button outline color="danger" type="reset" onClick={ () => { this.setState(prevState => ({ schema: { ...prevState.schema, schema: {}, conv: '' }})); } } >Reset</Button>
          </div>
        </Form>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Converter);
