/* eslint @typescript-eslint/lines-between-class-members: 0, lines-between-class-members: 0 */
import React, {ChangeEvent, Component, MouseEvent} from 'react';
import {Dispatch} from 'redux';
import {connect, ConnectedProps} from 'react-redux';
import {Helmet} from 'react-helmet-async';
import {toast} from 'react-toastify';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFileDownload, faFileUpload} from '@fortawesome/free-solid-svg-icons';
import {Button, ListGroup, ListGroupItem, Nav, NavItem, NavLink, TabContent, TabPane, Tooltip} from 'reactstrap';
import {Buffer} from 'buffer';
import classnames from 'classnames';
import {Draggable, Droppable} from 'react-drag-and-drop';
import locale from 'react-json-editor/dist/locale/en';

import {SchemaJADN} from './interface';
import {Info, Types} from './structure';
import {FormatJADN, JADNInput} from '../../utils';

import {RootState} from '../../../reducers';
import * as GenActions from '../../../actions/generate';
import * as ConformanceActions from "../../../actions/conformance";

// Module requires
import ViewConformanceTests from "../../conformance/ViewConformanceTests";
import RunConformanceTests from "../../conformance/RunConformanceTests";

// Interface
type Options = 'info' | 'types';
type Tabs = 'editor' | 'jadn' | 'tests' | 'test-results';

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
const mapStateToProps = (state: RootState) => ({
    siteTitle: state.Util.site_title
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    info: () => dispatch(GenActions.info()),
    setSchema: (s: SchemaJADN) => dispatch(GenActions.setSchema(s)),
    getConformanceTests: () => dispatch(ConformanceActions.getConformanceTests())
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type ConnectorProps = ConnectedProps<typeof connector>;
type GenerateConnectedProps = ConnectorProps;

// Component
class Generate extends Component<GenerateConnectedProps, GenerateState> {
    meta: {
        title: string;
        canonical: string;
    };
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

        const {info, siteTitle, getConformanceTests} = this.props;
        this.meta = {
            title: `${siteTitle} | Creator-Schema`,
            canonical: `${window.location.origin}${window.location.pathname}`
        };

        info();
        getConformanceTests();
    }

    shouldComponentUpdate(nextProps: GenerateConnectedProps, nextState: GenerateState) {
        const propsUpdate = this.props !== nextProps;
        const stateUpdate = this.state !== nextState;
        const { schema } = this.state;

        if (schema !== nextState.schema) {
            const {setSchema} = nextProps;
            setSchema(nextState.schema);
        }
        const shouldUpdate = propsUpdate || stateUpdate;
        return shouldUpdate;
    }

    onDrop(data: any) {
        const {schema} = this.state;
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
        const infoEditors = Object.keys(Info).map((k, i) => {
            const key = k as keyof typeof Info;
            const {editor} = Info[key];
            if (schema.info && k in schema.info) {
                return editor({
                    key: i,
                    value: schema.info[key],
                    placeholder: k,
                    change: val => this.setState(prevState => ({
                        schema: {
                            ...prevState.schema,
                            info: {
                                ...prevState.schema.info,
                                ...Info[key].edit(val)
                            }
                        }
                    })),
                    remove: (id: string) => {
                        if (schema.info && id in schema.info) {
                            this.setState(prevState => {
                                const tmpInfo = {...prevState.schema.info};
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
            }
            // eslint-disable-next-line no-useless-return
            return null;
        }).filter(Boolean);

        const typesEditors = (schema.types || []).map((def, i) => {
            const type = def[1].toLowerCase() as keyof typeof Types;
            return Types[type].editor({
                key: i,
                value: def,
                dataIndex: i,
                change: (val, idx: number) => this.setState(prevState => {
                    const tmpTypes = [...prevState.schema.types];
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
                            const tmpTypes = [...prevState.schema.types];
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
            <div className="col pt-2">
              <h2>Info</h2>
              {infoEditors}
            </div>
            <hr />
            <div className="col">
              <h2>Types</h2>
              {typesEditors}
            </div>
          </div>
        );
    }

    schemaOptions() {
        const {
            activeOption, download, downloadTooltip, uploadTooltip
        } = this.state;
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
          <div id='schema-options' className='col-md-2'>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={ classnames({active: activeOption === 'info'}) }
                  onClick={ () => this.toggleOptions('info') }
                >
                  Info
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={ classnames({active: activeOption === 'types'}) }
                  onClick={ () => this.toggleOptions('types') }
                >
                  Types
                </NavLink>
              </NavItem>
            </Nav>
                <TabContent activeTab={activeOption}>
                    <TabPane tabId='info'>
                        <ListGroup>
                            {infoKeys}
                        </ListGroup>
                    </TabPane>
                    <TabPane tabId='types'>
                        <ListGroup>
                            {typesKeys}
                        </ListGroup>
                    </TabPane>
                </TabContent>
                <div className='col-12 m-2'/>
                <div className='btn-group btn-group-sm'>
                    <Button id='uploadTooltip' color="primary"
                            onClick={() => this.schemaInput && this.schemaInput.click()}>
                        <FontAwesomeIcon icon={faFileUpload} color="white" size='2x'/>
                        <input
                            type='file'
                            className='d-none'
                            ref={input => {
                                this.schemaInput = input || undefined;
                            }}
                            accept=".jadn"
                            onChange={this.loadSchema}
                        />
                    </Button>
                    <Button id="downloadTooltip" color="primary" onClick={this.downloadConfig} href={download.content}
                            download={download.file} target="_blank" rel="noreferrer">
                        <FontAwesomeIcon icon={faFileDownload} color="white" size='2x'/>
                    </Button>
                </div>
                <Tooltip placement="bottom" isOpen={uploadTooltip} target="uploadTooltip"
                         toggle={() => this.setState(prevState => ({uploadTooltip: !prevState.uploadTooltip}))}>
                    Upload JADN Schema
                </Tooltip>
                <Tooltip placement="bottom" isOpen={downloadTooltip} target="downloadTooltip"
                         toggle={() => this.setState(prevState => ({downloadTooltip: !prevState.downloadTooltip}))}>
                    Download converted schema
                </Tooltip>
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
        const {files} = e.target;

        if (files && files.length > 0) {
            // toast(<p>Unable to load file</p>, {type: toast.TYPE.WARNING});

            const file = files[0];
            const fileReader = new FileReader();

            fileReader.onload = (_rf: FileReader, _ev: ProgressEvent<FileReader>) => {
                if (fileReader.result) {
                    const data = Buffer.from(fileReader.result.split(',')[1], 'base64').toString();
                    try {
                        this.setState({
                            schema: JSON.parse(data)
                        });
                    } catch (err) {
                        toast(<p>Schema cannot be loaded</p>, {type: toast.TYPE.ERROR});
                        console.log(err);
                    }
                }
            };

            fileReader.readAsDataURL(file);
        }
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
        const {activeView} = this.state;
        if (activeView !== view) {
            this.setState({
                activeView: view
            });
        }
    }

    render() {
        const {activeView, schema} = this.state;
        const {canonical, title} = this.meta;

        // @ts-ignore
        return (
            <div className='row mx-auto'>
                <Helmet>
                    <title>{title}</title>
                    <link rel="canonical" href={canonical}/>
                </Helmet>
                {this.schemaOptions()}
                <div id='schema-view' className='col-md-10'>
                    <Nav tabs>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeView === 'editor'})}
                                onClick={() => this.toggleViews('editor')}
                            >
                                Editor
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeView === 'jadn'})}
                                onClick={() => this.toggleViews('jadn')}
                            >
                                JADN
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeView === 'tests'})}
                                onClick={() => this.toggleViews('tests')}
                            >
                                View Tests
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink
                                className={classnames({active: activeView === 'test-results'})}
                                onClick={() => this.toggleViews('test-results')}
                            >
                                Run Tests
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <Droppable
                        types={['info', 'types']} // <= allowed drop types
                        onDrop={this.onDrop}
                        className='border col-12 p-0 pt-1'
                        style={{
                            minHeight: '20em'
                        }}
                    >
                        <TabContent activeTab={activeView}>
                            <TabPane tabId='editor'>
                                {this.schemaEditor()}
                            </TabPane>
                            <TabPane tabId='jadn'>
                                <JADNInput
                                    id='jadn_schema'
                                    placeholder={schema}
                                    onChange={
                                        val => {
                                            if (val.jsObject) {
                                                console.log("JADN Input onChange: " + val.jsObject);
                                                this.setState({schema: val.jsObject as SchemaJADN});
                                            }
                                        }
                                    }
                                    theme='light_mitsuketa_tribute'
                                    locale={locale}
                                    // reset
                                    height='100%'
                                    width='100%'
                                    viewOnly
                                    // waitAfterKeyPress={ 500 }
                                />
                            </TabPane>
                            <TabPane tabId='tests'>
                                <div className='m-2'>
                                    <ViewConformanceTests />
                                </div>
                            </TabPane>
                            <TabPane tabId='test-results'>
                                <div className='m-2'>
                                    <RunConformanceTests schema={ schema } />
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
