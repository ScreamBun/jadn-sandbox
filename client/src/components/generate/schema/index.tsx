/* eslint @typescript-eslint/lines-between-class-members: 0, lines-between-class-members: 0 */
import React, { ChangeEvent, Component, MouseEvent } from 'react';
import { Dispatch } from 'redux';
import { ConnectedProps, connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import {
  Button, ListGroup, ListGroupItem, Nav, NavItem, NavLink, TabContent, TabPane, Tooltip
} from 'reactstrap';
import classnames from 'classnames';
import { Draggable, Droppable } from 'react-drag-and-drop';
import locale from 'react-json-editor/dist/locale/en';

import { SchemaJADN } from './interface';
import { Info, Types } from './structure';
import { FormatJADN, JADNInput } from '../../utils';

import { RootState } from '../../../reducers';
import * as GenActions from '../../../actions/generate';

// Interface
type Options = 'info' | 'types';
type Tabs = 'editor' | 'jadn';
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface GenerateProps {}

interface GenerateState {
  downloadTooltip: boolean;
  uploadTooltip: boolean;
  schema: SchemaJADN;
  activeOption: Options;
  activeView: Tabs;
  download: {
    content: string;
    file: string;
  };
}

// Redx Connector
function mapStateToProps(state: RootState) {
  return {
    siteTitle: state.Util.site_title
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    info: () => dispatch(GenActions.info())
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type GenerateConnectedProps = GenerateProps & ConnectorProps;

// Component
class Generate extends Component<GenerateConnectedProps, GenerateState> {
  meta: {
    title: string;
    canonical: string;
  }
  schemaInput?: HTMLInputElement;

  constructor(props: GenerateConnectedProps) {
    super(props);
    this.downloadConfig = this.downloadConfig.bind(this);
    this.loadSchema = this.loadSchema.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      downloadTooltip: false,
      uploadTooltip: false,
      schema: {
        types: []
      },
      activeOption: 'info',
      activeView: 'editor',
      download: {
        content: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({error: 'No Schema Defined'}))}`,
        file: 'schema.jadn'
      }
    };

    const { info, siteTitle } = this.props;
    this.meta = {
        title: `${siteTitle} | Creator-Schema`,
        canonical: `${window.location.origin}${window.location.pathname}`
    };

    info();
  }

  shouldComponentUpdate(nextProps: GenerateConnectedProps, nextState: GenerateState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  onDrop(data: any) {
    const { schema } = this.state;
    if (data.info) {
      if (!(data.info in (schema.info || {}))) {
        this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            info: {
              ...prevState.schema.info || {},
              ...Info[data.info].edit()
            }
          }
        }));
      }
    } else if (data.types) {
      this.setState(prevState => {
        const tmpTypes = prevState.schema.types || [];
        const tmpDef = Types[data.types].edit();
        if ((tmpTypes.filter(d => d[0] === tmpDef[0]) || []).length === 0) {
            tmpTypes.push(tmpDef);
        }
        return {
          schema: {
            ...prevState.schema,
            types: tmpTypes
          }
        };
      });
    } else {
      console.log('oops...');
    }
  }

  schemaEditor() {
    const { schema } = this.state;
    const infoEditors = Object.keys(schema.info || {}).map((k, i) => {
      return Info[k].editor({
        key: i,
        value: schema.info[k],
        placeholder: k,
        change: (val) => this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            info: {
              ...prevState.schema.info,
              ...Info[k].edit(val)
            }
          }
        })),
        remove: (id: string) => {
          if (id in schema.info) {
            this.setState(prevState => {
              const tmpInfo = { ...prevState.schema.info };
              delete tmpInfo[id];
              return {
                schema: {
                  ...prevState.schema,
                  info: tmpInfo
                }
              };
            });
          }
        }
      });
    });

    const typesEditors = (schema.types || []).map((def, i) => {
      const type = def[1].toLowerCase();
      return Types[type].editor({
        key: i,
        value: def,
        dataIndex: i,
        change: (val, idx: number) => this.setState(prevState => {
          const tmpTypes = [ ...prevState.schema.types ];
          tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);
          return {
            schema: {
              ...prevState.schema,
              types: tmpTypes
            }
          };
        }),
        remove: (idx: number) => {
          if (schema.types.length >= idx) {
            this.setState(prevState => {
              const tmpTypes = [ ...prevState.schema.types ];
              tmpTypes.splice(idx, 1);
              return {
                schema: {
                  ...prevState.schema,
                  types: tmpTypes
                }
              };
            });
          }
        }
      });
    });

    return (
      <div>
        <div className='col-12'>
          <h2>Info</h2>
          { infoEditors }
        </div>
        <hr />
        <div className='col-12'>
          <h2>Types</h2>
          { typesEditors }
        </div>
      </div>
    );
  }

  downloadConfig(_e: MouseEvent<HTMLButtonElement>) {
    this.setState(prevState => ({
      download: {
        ...prevState.download,
        content: `data:application/json;charset=utf-8,${encodeURIComponent(FormatJADN(prevState.schema))}`
      }
    }));
  }

  loadSchema(e: ChangeEvent<HTMLInputElement>) {
    const { files } = e.target;
    const file = files[0];
    const fileReader = new FileReader();

    fileReader.onload = (_rf: FileReader, _ev: ProgressEvent<FileReader>) => {
      const data = atob(fileReader.result.split(',')[1]);
      try {
        this.setState({
          schema: JSON.parse(data)
        });
      } catch (err) {
        toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING});
        console.log(err);
      }
    };

    fileReader.readAsDataURL(file);
  }

  toggleOptions(opt: Options) {
    const { activeOption } = this.state;
    if (activeOption !== opt) {
      this.setState({
        activeOption: opt
      });
    }
  }

  toggleViews(view: Tabs) {
    const { activeView } = this.state;
    if (activeView !== view) {
      this.setState({
        activeView: view
      });
    }
  }

  render() {
    const {
      activeOption, activeView, download, downloadTooltip, schema, uploadTooltip
    } = this.state;
    const { canonical, title } = this.meta;
    const infoKeys = Object.keys(Info).map(k => (
      <Draggable type="info" data={ k } key={ Info[k].key }>
        <ListGroupItem action>{ Info[k].key }</ListGroupItem>
      </Draggable>
    ));
    const typesKeys = Object.keys(Types).map(k => (
      <Draggable type="types" data={ k } key={ Types[k].key }>
        <ListGroupItem action>{ Types[k].key }</ListGroupItem>
      </Draggable>
    ));

    return (
      <div className='row mx-auto'>
        <Helmet>
          <title>{ title }</title>
          <link rel="canonical" href={ canonical } />
        </Helmet>
        <div id='schema-options' className='col-md-2'>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={ classnames({ active: activeOption === 'info' }) }
                onClick={ () => this.toggleOptions('info') }
              >
                Info
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({ active: activeOption === 'types' }) }
                onClick={ () => this.toggleOptions('types') }
              >
                Types
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={ activeOption }>
            <TabPane tabId='info'>
              <ListGroup>
                { infoKeys }
              </ListGroup>
            </TabPane>
            <TabPane tabId='types'>
              <ListGroup>
                { typesKeys }
              </ListGroup>
            </TabPane>
          </TabContent>
          <div className='col-12 m-2' />
          <div className='btn-group btn-group-sm'>
            <Button id='uploadTooltip' color="primary" onClick={ () => this.schemaInput && this.schemaInput.click() }>
              <FontAwesomeIcon icon={ faFileUpload } color="white" size='2x' />
              <input
                type='file'
                className='d-none'
                ref={ input => { this.schemaInput = input || undefined; } }
                accept=".jadn"
                onChange={ this.loadSchema }
              />
            </Button>
            <Button id="downloadTooltip" color="primary" onClick={ this.downloadConfig } href={ download.content } download={ download.file } target="_blank" rel="noreferrer" >
              <FontAwesomeIcon icon={ faFileDownload } color="white" size='2x' />
            </Button>
          </div>
          <Tooltip placement="bottom" isOpen={ uploadTooltip } target="uploadTooltip" toggle={ () => this.setState(prevState => ({ uploadTooltip: !prevState.uploadTooltip })) }>
            Upload JADN Schema
          </Tooltip>
          <Tooltip placement="bottom" isOpen={ downloadTooltip } target="downloadTooltip" toggle={ () => this.setState(prevState => ({ downloadTooltip: !prevState.downloadTooltip })) }>
            Download converted schema
          </Tooltip>
        </div>
        <div id='schema-view' className='col-md-10'>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={ classnames({ active: activeView === 'editor' }) }
                onClick={ () => this.toggleViews('editor') }
              >
                Editor
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={ classnames({ active: activeView === 'jadn' }) }
                onClick={ () => this.toggleViews('jadn') }
              >
                JADN
              </NavLink>
            </NavItem>
          </Nav>
          <Droppable
            types={ ['info', 'types'] } // <= allowed drop types
            onDrop={ this.onDrop }
            className='border col-12 p-0 pt-1'
            style={{
              minHeight: '20em'
            }}
          >
            <TabContent activeTab={ activeView }>
              <TabPane tabId='editor'>
                { this.schemaEditor() }
              </TabPane>
              <TabPane tabId='jadn'>
                <div className="form-control m-0 p-0" style={{ minHeight: '20em' }}>
                  <JADNInput
                    id='jadn_schema'
                    placeholder={ schema }
                    onChange={
                      val => {
                        if (val.jsObject) {
                          this.setState({ schema: val.jsObject as SchemaJADN });
                        }
                      }
                    }
                    theme='light_mitsuketa_tribute'
                    locale={ locale }
                    // reset
                    height='100%'
                    width='100%'
                    viewOnly
                    // waitAfterKeyPress={ 500 }
                  />
                </div>
              </TabPane>
            </TabContent>
          </Droppable>
        </div>
      </div>
    );
  }
}

export default connector(Generate);