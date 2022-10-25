import React, { ChangeEvent, Component } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import JSONPretty from 'react-json-pretty';
import {
  Button, ButtonGroup, Form, FormGroup, Input, FormText, Nav, NavItem, NavLink, TabContent, TabPane, Tooltip
} from 'reactstrap';
import classnames from 'classnames';
import locale from 'react-json-editor/dist/locale/en';
import { v4 as uuid4 } from 'uuid';

import { Field, delMultiKey, setMultiKey } from './lib';
import { SchemaJADN, StandardFieldArray } from '../schema/interface';
import {
  escaped2cbor, hexify, loadURL, validURL
} from '../../utils';
import JADNInput from '../../utils/jadn-editor';
import { GenerateActions, UtilActions, ValidateActions } from '../../../actions';
import { RootState } from '../../../reducers';

// Interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GenerateCommandProps {}

type Tabs = 'creator' | 'message';
interface GenerateCommandState {
  commandRecord: string;
  schema: {
    selected: string;
    file: boolean;
    url: boolean;
    urlStr: string;
    schema: Record<string, any>;
    decodeTypes: {
      all: Array<any>;
      exports: Array<any>;
    },
  };
  message: Record<string, any>;
  activeView: Tabs;
  verTooltip: boolean;
}

// Redux Connector
const mapStateToProps = (state: RootState) => ({
  schemas: state.Generate.schemas,
  loadedSchemas: state.Util.loaded.schemas || {},
  validSchema: state.Validate.valid.schema || {},
  selectedSchema: state.Generate.selectedSchema,
  message: state.Generate.message,
  siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  info: () => dispatch(GenerateActions.info()),
  loadFile: (t: string, f: string) => dispatch(UtilActions.load(t, f)),
  validateSchema: (s: Record<string, any>) => dispatch(ValidateActions.validateSchema(s)),
  setSchema: (s: Record<string, any>) => dispatch(GenerateActions.setSchema(s as SchemaJADN))
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type GenerateCommandConnectedProps = GenerateCommandProps & ConnectorProps;

// Component
class GenerateCommand extends Component<GenerateCommandConnectedProps, GenerateCommandState> {
  meta: {
    title: string;
    canonical: string;
  };

  constructor(props: GenerateCommandConnectedProps) {
    super(props);
    this.fileChange = this.fileChange.bind(this);
    this.optChange = this.optChange.bind(this);
    this.selectChange = this.selectChange.bind(this);

    this.state = {
      commandRecord: '',
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
      },
      message: {},
      activeView: 'creator',
      verTooltip: false
    };

    const { info, siteTitle } = this.props;
    this.meta = {
      title: `${siteTitle} | Creator-Message`,
      canonical: `${window.location.origin}${window.location.pathname}`
    };

    info();
  }

  shouldComponentUpdate(nextProps: GenerateCommandConnectedProps, nextState: GenerateCommandState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;

    const { schema } = this.state;
    if (schema.schema !== nextState.schema.schema) {
      const { setSchema } = this.props;
      setSchema(nextState.schema.schema);
      nextState.message.message = {};
    }

    return propsUpdate || stateUpdate;
  }

  makeID() {
    console.log('Make ID');
    this.setState(prevState => ({
      message: {
        ...prevState.message,
        id: uuid4()
      }
    }));
  }

  optChange(k: string, v: any) {
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

    const setType = (t: 'message'|'schema', v: Record<string, any>) => {
      this.setState(prevState => ({
        ...prevState,
        [t]: {
          ...prevState[t],
          ...v
        }
      }));

    };

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

      if (['', 'empty', null, 'file', 'url'].includes(selected)) {
        console.log('issues...');
        setType(type, {
          [type]: loaded[value]
        });
      } else {
        console.log('selected schema', selected);
        const format: Record<string, any> = {};
        if (type === 'message') {
          // eslint-disable-next-line prefer-destructuring
          format.format = selected.split('.')[1];
        }

        if (!Object.keys(loaded).includes(selected)) {
          const { loadFile } = this.props;
          console.log('load schema');
          loadFile(`${type}s`, selected).then(() => {
            return setType(type, {
              ...format,
              [type]: loaded[selected]
            });
          }).catch(_err => {});
        } else {
          setType(type, {
            ...format,
            [type]: loaded[selected]
          });
        }
      }
    });
  }

  fileChange(e: ChangeEvent<HTMLInputElement >) {
    const { id, files } = e.target;
    const prefix = id.split('-')[0];
    if (files) {
      const [ file ] = files;
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
  }

  loadURL(t: 'message'|'schema') {
    // eslint-disable-next-line react/destructuring-assignment, prefer-destructuring
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

    loadURL(urlStr).then(data => {
      this.setState(prevState => ({
        ...prevState,
        [t]: {
          ...prevState[t],
          [t]: data.data,
          format: fileExt === 'jadn' ? 'json' : data.fileExt
        }
      }));
      return '';
    }).catch(_err => {
      toast(<p>Invalid url, please check what you typed</p>, {type: toast.TYPE.WARNING});
    });
  }

  toggleViews(view: Tabs) {
    const { activeView } = this.state;
    if (activeView !== view) {
      this.setState({
        activeView: view
      });
    }
  }

  verifySchema() {
    const { schema } = this.state;
    let schemaObj = schema.schema;
    if (typeof(schema.schema) === 'string') {
      try {
        schemaObj = JSON.parse(schema);
      } catch (err) {
        toast(<p>{ (err as Error).message }</p>, {type: toast.TYPE.WARNING});
        return;
      }
    }
    const { validSchema, validateSchema } = this.props;
    validateSchema(schemaObj).then(() => {
      const { valid_bool, valid_msg } = validSchema;
      return toast(<p>{ valid_msg }</p>, {type: toast.TYPE[valid_bool ? 'INFO' : 'WARNING']});
    }).catch(_err => {});
  }

  cmdCreator(maxHeight: number) {
    const { selectedSchema } = this.props;
    const { activeView, commandRecord, message } = this.state;
    const exportRecords: Array<string> = selectedSchema.info && selectedSchema.info.exports || [];
    const recordDefs = selectedSchema && selectedSchema.types ? selectedSchema.types.filter(t => t[0] === commandRecord) : [];
    const recordDef = recordDefs.length === 1 ? recordDefs[0] : [];
    let commandFields: null|JSX.Element = null;
    if (recordDef.length > 1 && recordDef[recordDef.length - 2].length > 0) {
      commandFields = (
        <FormText color="muted">
          <b>Comment: </b>
          { recordDef[recordDef.length - 2] }
        </FormText>
      );
     }

    let fieldDefs: null|JSX.Element|JSX.Element[] = null;
    if (Array.isArray(recordDef[recordDef.length - 1])) {
      const fields = recordDef[recordDef.length - 1] as Array<StandardFieldArray>;
      fieldDefs = fields.map(def => <Field key={ `${def[0]}-${def[1]}` } def={ def } optChange={ this.optChange } />);
    } else {
      fieldDefs = (
        <FormText color="muted">
          Command Fields will appear here after selecting a type
          &nbsp;
          { commandRecord }
        </FormText>
      );
    }

    return (
      <div className='col-md-6'>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={ classnames({ active: activeView === 'creator' }) }
              onClick={ () => this.toggleViews('creator') }
            >
              Creator
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={ classnames({ active: activeView === 'message' }) }
              onClick={ () => this.toggleViews('message') }
            >
              Message
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={ activeView }>
          <TabPane tabId='creator'>
            <div className='card col-12 p-0 mx-auto'>
              <div className='card-header'>
                <FormGroup className='col-md-6 p-0 m-0 float-left'>
                  <Input type='select' name='command-list' id='command-list' className='form-control' default='' onChange={ e => { this.setState({'commandRecord': e.target.value, message: {}}); } }>
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
          </TabPane>

          <TabPane tabId='message' style={{ height: `${maxHeight}px` }}>
            <JSONPretty
              id='message'
              className='scroll-xl border'
              style={{ minHeight: '2.5em' }}
              json={ message }
            />
          </TabPane>
        </TabContent>
      </div>
    );
  }

  schema(maxHeight: number) {
    const { schemas } = this.props;
    const { schema, verTooltip } = this.state;
    // list of options - <option value="{{ opt }}">{{ opt }}</option>
    const schemaOpts = schemas.map(s => <option key={ s } value={ s }>{ s }</option>);

    return (
      <div className='col-md-6'>
        <div id="schema-card" className="tab-pane fade active show">
          <div className="card">
            <div className="card-header">
              <ButtonGroup className="float-right">
                <Button outline color="secondary" onClick={ () => this.verifySchema() } id="verTooltip" >Verify</Button>
                <Tooltip placement="bottom" isOpen={ verTooltip } target="verTooltip" toggle={ () => this.setState(prevState => ({ verTooltip: !prevState.verTooltip })) }>
                  Validate the schema is valid prior to validating the message
                </Tooltip>
              </ButtonGroup>

              <div className="col-sm-10 pl-0">
                <div className="form-group col-md-6 pr-0 pl-1 d-inline-block">
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

export default connector(GenerateCommand);
