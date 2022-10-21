import React, {
  ChangeEvent, Component, FormEvent, MouseEvent
} from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import PopoutWindow from 'react-popout';
import FileSaver from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faFilePdf, faWindowMaximize } from '@fortawesome/free-solid-svg-icons';
import { Button, Form, Tooltip } from 'reactstrap';
import HTMLParser from 'html-react-parser';
import locale from 'react-json-editor/dist/locale/en';

import { SchemaJADN } from '../generate/schema/interface';
import {
  escaped2cbor, format, hexify, loadURL, minify, validURL
} from '../utils';
import JSONInput from '../utils/jadn-editor';
import { ConvertActions, UtilActions, ValidateActions } from '../../actions';
import { RootState } from '../../reducers';


// Interface
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ConverterProps {}

interface ConverterState {
  convTooltip: boolean;
  convertDownloadTooltip: boolean;
  pdfDownloadTooltip: boolean;
  viewSchemaTooltip: boolean;
  schemaOptsDropdown: boolean;
  message: {
    data: string;
    format: string;
    json: Record<string, any>;
    message: string;
    file: boolean;
    url: boolean;
    urlStr: ''
  };
  schema: {
    schema: SchemaJADN,
    selected: string;
    comments: boolean;
    file: boolean;
    url: boolean;
    urlStr: ''
  };
  convert: {
    selected: string;
    html: boolean;
    popup?: PopoutWindow
  };
}

type StateTypes = 'message'|'message-json'|'schema'
type MimeType = 'cddl'|'html'|'jadn'|'json'|'md'|'proto3'|'rng'|'thrift';

// Redux Connector
function mapStateToProps(state: RootState) {
  return {
    schemas: state.Convert.schemas || [],
    loadedSchemas: state.Util.loaded.schemas || [],
    validSchema: state.Validate.valid.schema || {},
    conversions: state.Convert.conversions || {},
    convertedSchema: state.Convert.converted || {},
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    info: () => dispatch(ConvertActions.info()),
    convertSchema: (s: Record<string, any>, t: string, c: boolean) => dispatch(ConvertActions.convertSchema(s, t, c)),
    loadFile: (t: string, f: string) => dispatch(UtilActions.load(t, f)),
    validateSchema: (s: Record<string, any>) => dispatch(ValidateActions.validateSchema(s))
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type ConverterConnectedProps = ConverterProps & ConnectorProps;

// Component
class Converter extends Component<ConverterConnectedProps, ConverterState> {
  meta: {
    title: string;
    canonical: string;
  }

  schemaHeight = '40em';
  downloadMime: Record<MimeType, string> = {
    cddl: 'text/plain',
    html: 'text/html',
    md: 'text/plain',
    jadn: 'application/json',
    json: 'application/json',
    proto3: 'text/x-c',
    rng: 'application/xml',
    thrift: 'text/plain'
  }

  constructor(props: ConverterConnectedProps) {
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
        message: '',
        file: false,
        url: false,
        urlStr: ''
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
        html: false
      }
    };

    const { info, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Convert`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };
    info();
  }

  shouldComponentUpdate(nextProps: ConverterConnectedProps, nextState: ConverterState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  submitForm(e: FormEvent<HTMLFormElement>) {
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

  selectChange(e: ChangeEvent<HTMLSelectElement>) {
    const { id, value } = e.target;
    const type = id.split('-')[0];
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
      const loaded = this.props[`loaded${type[0].toUpperCase()}${type.slice(1)}s`];
      // eslint-disable-next-line react/destructuring-assignment
      const { selected } = this.state[type];

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
            }));
          });
        } else {
          this.setState(prevState => ({
            ...prevState,
            [type]: {
              ...prevState[type],
              [type]: loaded[selected]
            }
          }));
        }
      }
    });
  }

  fileChange(e: ChangeEvent<HTMLInputElement>) {
    const { files, id } = e.target;
    const [ file ] = files;
    const prefix = id.split('-')[0];
    const type = file.name.split('.')[1];
    const fileReader = new FileReader();

    fileReader.onload = (fr: FileReader, _ev: ProgressEvent<FileReader>) => {
      let data = atob(fr.result.split(',')[1]);
      try {
        data = JSON.stringify(JSON.parse(data), null, 2);
      } catch (err) {
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
        } catch (err) {
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

      this.setState(prevState => ({ message: { ...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
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
        toast(<p>{ `${t.charAt(0).toUpperCase() + t.slice(1)} {msg}` }</p>, {type: toast.TYPE.WARNING});
        return;
      }
      this.setState(prevState => ({ message: {...prevState.message, [t === 'message' ? 'message' : 'json']: msg }}));
    } else if (t === 'schema') {
      try {
        this.setState(prevState => ({ schema: {...prevState.schema, schema: prevState.schema.schema }}));
      } catch (e) {
        const msg = `${t.charAt(0).toUpperCase() + t.slice(1)} Invalid, cannot format: ${(e as Error).message}`;
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

  loadURL(t: 'message'|'schema') {
    // eslint-disable-next-line react/destructuring-assignment
    const { urlStr } = this.state[t];

    if (!validURL(urlStr)) {
      toast(<p>Invalid URL, cannot load from a non valid location</p>, {type: toast.TYPE.WARNING});
      return;
    }

    const file = urlStr.substring(urlStr.lastIndexOf('/') + 1);
    const fileExt = file.substring(file.lastIndexOf('.') + 1);

    if (!['json', 'jadn'].includes(fileExt) && t === 'schema') {
      toast(<p>This file cannot be loaded as a schema, only JADN/JSON files are valid</p>, {type: toast.TYPE.WARNING});
      return;
    }

    loadURL(urlStr).then((data) => {
      const d = data as Record<string, any>;
      this.setState(prevState => ({
        ...prevState,
        [t]: {
          ...prevState[t],
          [t]: d.data,
          format: fileExt === 'jadn' ? 'json' : d.fileExt
        }
      }));
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
      const fmt = convertedSchema.fmt as MimeType;
      rtn.file = `schema.${fmt}`;

      if (fmt in this.downloadMime) {
        rtn.content = `data:${this.downloadMime[fmt]};charset=utf-8,${encodeURIComponent(schema)}`;
      } else {
        rtn.content = `data:text/plain;charset=utf-8,${encodeURIComponent('Theres some issues....')}`;
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

  downloadPDF(e: MouseEvent<HTMLButtonElement>) {
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

  viewPage(e: MouseEvent<HTMLButtonElement>) {
    const { convertedSchema } = this.props;
    e.preventDefault();
    const nulls = ['', ' ', null, undefined];
    const htmlTmp = HTMLParser(convertedSchema.convert.replace(/^\s+/gm, '').replace(/\s+$/gm, '')) as JSX.Element;

    // CSS Theme
    let theme = htmlTmp.props.children.filter(c => c.type === 'head');
    theme = (theme.length === 1 ? theme[0].props.children : []).filter(c => nulls.indexOf(c) === -1);
    theme = theme.filter(t => t.type === 'style');
    theme = theme.length === 1 ? theme[0] : {};

    // HTML Schema
    let schema = htmlTmp.props.children.filter(c => c.type === 'body');
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
          children: elm.props.children.map(c => {
            if (typeof(c) === 'string' && !c.match(/^[\r\n\s]*?$/gm)) {
              return c;
            }
            return filter(c);
          }).filter(c => !nulls.includes(c))
        });
      }
      let tmp = elm.map(el => filter(el)).filter(el => !nulls.includes(el));
      tmp = tmp.map((el, i) => {
        let children = filter(el.props.children);
        try {
          children = children.filter(c => !nulls.includes(c));
        } catch (err) {
          console.log(err);
        }
        return React.cloneElement(el, {
          key: i,
          children
        });
      });
      return tmp.length === 1 ? tmp[0] : tmp;
    };

    const sizeDivisor = 1.5;
    schema = filter(schema);
    this.setState(prevState => ({
      ...prevState,
      convert: {
        ...prevState.convert,
        popup: (
          <PopoutWindow
            title="HTML Schema"
            center="screen"
            options={
              {
                width: (_opt: Record<string, any>, win: Window) => win.outerWidth / sizeDivisor,
                height:(_opt: Record<string, any>, win: Window) => win.outerHeight / sizeDivisor,
                top: (opt: Record<string, any>, win: Window) => (win.innerHeight - opt.height(opt, win)) / sizeDivisor + win.screenY,
                left: (opt: Record<string, any>, win: Window) => (win.innerWidth - opt.width(opt, win)) / sizeDivisor + win.screenX
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
    const schemaOpts = schemas.map(s=> <option key={ s } value={ s } >{ s }</option>);

    return (
      <fieldset className="col-6 p-0 float-left">
        <legend>JADN Schema</legend>
        <div className="card">
          <div className="form-control border card-body p-0" style={{ height: this.schemaHeight }}>
            <JSONInput
              id='jadn_schema'
              placeholder={ schema.schema }
              onChange={
                val => {
                  if (val.jsObject) {
                    this.setState(prevState => ({ schema: { ...prevState.schema, schema: val.jsObject }}));
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
                <select id="schema-list" name="schema-list" className="form-control mb-0" defaultValue="empty" onChange={ this.selectChange }>
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
                  <input type="text" className="form-control" defaultValue='' onChange={ (e) => this.setState(prevState => ({ schema: { ...prevState.schema, urlStr: e.target.value }})) } />
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
          <div className="form-control card-body p-0" style={{ height: this.schemaHeight }}>
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
              <Button id="viewSchemaTooltip" color="info" href="#" onClick={ this.viewPage }>
                <FontAwesomeIcon icon={ faWindowMaximize } size='2x' />
              </Button>
              <Tooltip placement="bottom" isOpen={ viewSchemaTooltip } target="viewSchemaTooltip" toggle={ () => this.setState(prevState => ({ viewSchemaTooltip: !prevState.viewSchemaTooltip })) }>
                View Schema in new window
              </Tooltip>

              <Button id="pdfDownloadTooltip" color="info" href="#" onClick={ this.downloadPDF }>
                <FontAwesomeIcon icon={ faFilePdf } size='2x' />
              </Button>
              <Tooltip placement="bottom" isOpen={ pdfDownloadTooltip } target="pdfDownloadTooltip" toggle={ () => this.setState(prevState => ({ pdfDownloadTooltip: !prevState.pdfDownloadTooltip })) }>
                Download PDF of the schema
              </Tooltip>
            </div>
            { convert.popup }
            <div className="form-row ml-1 mb-0">
              <div className="form-group col-md-6 px-1 mb-0">
                <select id="convert-to" name="convert-to" className="form-control" defaultValue="empty" onChange={ e => this.setState(prevState => ({ convert: { ...prevState.convert, selected: e.target.value } })) }>
                  <option value="empty">Convert To...</option>
                  { convertOpts }
                </select>
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
