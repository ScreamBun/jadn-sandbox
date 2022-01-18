import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileDownload, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import {
  ListGroup, ListGroupItem,  Nav, NavItem, NavLink, TabContent, TabPane, Tooltip
} from 'reactstrap';
import classnames from 'classnames';
import { Draggable, Droppable } from 'react-drag-and-drop';

import SchemaStructure from './lib/structure';
import { FormatJADN } from '../../utils';
import JADNInput from '../../utils/jadn-editor';
import locale from 'react-json-editor/dist/locale/en';

import * as GenActions from '../../../actions/generate';
import * as ValidateActions from '../../../actions/validate';
import * as UtilActions from '../../../actions/util';


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
    this.downloadConfig = this.downloadConfig.bind(this);
    this.loadSchema = this.loadSchema.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      download_tooltip: false,
      upload_tooltip: false,
      schema: {},
      activeOption: 'meta',
      activeView: 'editor',
      download: {
        content: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify({error: 'No Schema Defined'}))}`,
        file: 'schema.jadn'
      }
    };

    this.keys = SchemaStructure;
    this.schemaInput = null;
    this.schemaDownload = null;

    const { info, siteTitle } = this.props;
    this.meta = {
        title: `${siteTitle} | Creator-Schema`,
        canonical: `${window.location.origin}${window.location.pathname}`
    };

    info();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = this.props !== nextProps;
    const stateUpdate = this.state !== nextState;
    return propsUpdate || stateUpdate;
  }

  onDrop(data) {
    const { schema } = this.state;
    if (data.meta) {
      if (!(data.meta in (schema.meta || {}))) {
        this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            meta: {
              ...prevState.schema.meta || {},
              ...this.keys.meta[data.meta].edit()
            }
          }
        }));
      }
    } else if (data.types) {
      this.setState(prevState => {
        const tmpTypes = prevState.schema.types || [];
        const tmpDef = this.keys.types[data.types].edit();
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
    let metaEditors = Object.keys(schema.meta || {}).map((k, i) => {
      return this.keys.meta[k].editor({
        key: i,
        value: schema.meta[k],
        placeholder: k,
        change: val => this.setState(prevState => ({
          schema: {
            ...prevState.schema,
            meta: {
              ...prevState.schema.meta,
              ...this.keys.meta[k].edit(val)
            }
          }
        })),
        remove: id => {
          if (id in schema.meta) {
            this.setState(prevState => {
              const tmpMeta = { ...prevState.schema.meta };
              delete tmpMeta[id];
              return {
                schema: {
                  ...prevState.schema,
                  meta: tmpMeta
                }
              };
            });
          }
        }
      });
    });

    let typesEditors = (schema.types || []).map((def, i) => {
      let type = def[1].toLowerCase();

      return this.keys.types[type].editor({
        key: i,
        value: def,
        dataIndex: i,
        change: (val, idx) => this.setState(prevState => {
          let tmpTypes = [ ...prevState.schema.types ];
          tmpTypes[idx] = this.keys.types[val.type.toLowerCase()].edit(val);
          return {
            schema: {
              ...prevState.schema,
              types: tmpTypes
            }
          };
        }),
        remove: idx => {
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
          <h2>Meta</h2>
          { metaEditors }
        </div>
        <hr />
        <div className='col-12'>
          <h2>Types</h2>
          { typesEditors }
        </div>
      </div>
    );
  }

  downloadConfig(e) {
    e.preventDefault();
    this.setState(prevState => ({
      download: {
        ...prevState.download,
        content: `data:application/json;charset=utf-8,${encodeURIComponent(FormatJADN(prevState.schema))}`
      }
    }), () => {
      this.schemaDownload.click();
    });
  }

  loadSchema(e) {
    const file = e.target.files[0];
    const fileReader = new FileReader();

    fileReader.onload = (_rf, _ev) => {
      const data = atob(fileReader.result.split(',')[1]);
      try {
        this.setState({
          schema: JSON.parse(data)
        });
      } catch (err) {
        toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.WARNING});
        console.log(err);
        return;
      }
    };

    fileReader.readAsDataURL(file);
  }

  toggleOptions(opt) {
    const { activeOption } = this.state;
    if (activeOption !== opt) {
      this.setState({
        activeOption: opt
      });
    }
  }

  toggleViews(view) {
    const { activeView } = this.state;
    if (activeView !== view) {
      this.setState({
        activeView: view
      });
    }
  }

  render() {
    const {
      activeOption, activeView, download, download_tooltip, schema, upload_tooltip
    } = this.state;
    const { canonical, title } = this.meta;
    const metaKeys = Object.keys(this.keys.meta).map((k, i) => (
      <Draggable type="meta" data={ k } key={ i }>
        <ListGroupItem action>{ this.keys.meta[k].key }</ListGroupItem>
      </Draggable>
    ));
    const typesKeys = Object.keys(this.keys.types).map((k, i) => (
      <Draggable type="types" data={ k } key={ i }>
        <ListGroupItem action>{ this.keys.types[k].key }</ListGroupItem>
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
                className={ classnames({ active: activeOption === 'meta' }) }
                onClick={ () => this.toggleOptions('meta') }
              >
                Meta
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
            <TabPane tabId='meta'>
              <ListGroup>
                { metaKeys }
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
            <a id='upload_tooltip' className="btn btn-primary" onClick={ () => this.schemaInput.click() }>
              <FontAwesomeIcon icon={ faFileUpload } color="white" size='2x' />
              <input
                type='file'
                className='d-none'
                ref={ input => this.schemaInput = input }
                accept=".jadn"
                onChange={ this.loadSchema }
              />
            </a>
            <a className='d-none' href={ download.content } download={ download.file } target="_blank" rel="noreferrer" ref={ input => this.schemaDownload = input } />
            <a id='download_tooltip' className="btn btn-primary" onClick={ this.downloadConfig }>
              <FontAwesomeIcon icon={ faFileDownload } color="white" size='2x' />
            </a>
          </div>
          <Tooltip placement="bottom" isOpen={ upload_tooltip } target="upload_tooltip" toggle={ () => this.setState(prevState => ({ upload_tooltip: !prevState.upload_tooltip })) }>
            Upload JADN Schema
          </Tooltip>
          <Tooltip placement="bottom" isOpen={ download_tooltip } target="download_tooltip" toggle={ () => this.setState(prevState => ({ download_tooltip: !prevState.download_tooltip })) }>
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
            types={ ['meta', 'types'] } // <= allowed drop types
            onDrop={ this.onDrop }
            className='border col-12 p-0'
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
                          this.setState({ schema: val.jsObject });
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

export default connect(mapStateToProps, mapDispatchToProps)(Generate);
