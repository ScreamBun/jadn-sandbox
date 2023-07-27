import React, { useEffect, useRef, useState } from 'react'
import { TabContent, TabPane, Button, ListGroup, Nav, NavItem, NavLink, ListGroupItem } from 'reactstrap'
import { Draggable, Droppable } from 'react-drag-and-drop';
import { Info, Types } from './structure/structure';
import { loadFile, setSchema } from 'actions/util';
import { useDispatch, useSelector } from 'react-redux';
import { faCheck, faGripLines, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import { getAllSchemas } from 'reducers/util';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBEditor from 'components/common/SBEditor';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../consts';
import SBDownloadFile from 'components/common/SBDownloadFile';
import SBFileUploader from 'components/common/SBFileUploader';
import { FormatJADN } from 'components/utils';
import { validateSchema } from 'actions/validate';

const configInitialState = {
    $MaxBinary: $MAX_BINARY,
    $MaxString: $MAX_STRING,
    $MaxElements: $MAX_ELEMENTS,
    $Sys: $SYS,
    $TypeName: $TYPENAME,
    $FieldName: $FIELDNAME,
    $NSID: $NSID
}

const SchemaCreator = (props: any) => {
    const dispatch = useDispatch();
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema } = props;

    const [configOpt, setConfigOpt] = useState(configInitialState);
    const [data, setData] = useState(''); //generatedSchema JSON string
    const [isValidJADN, setIsValidJADN] = useState(false);
    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const schemaOpts = useSelector(getAllSchemas);
    const ref = useRef<HTMLInputElement | null>(null);
    const scrollToInfoRef = useRef<HTMLInputElement | null>(null);
    const scrollToTypeRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setIsValidJADN(false);
        if (generatedSchema) {
            const schemaStr = FormatJADN(generatedSchema);
            dispatch(setSchema(generatedSchema));
            setData(schemaStr);

            //set configuration data
            const configDefs = generatedSchema.info && generatedSchema.info.config ? generatedSchema.info.config : [];
            if (configDefs.length != 0) {
                for (const [key, value] of Object.entries(configDefs)) {
                    if (key in configOpt && configOpt[key] != value && value != '') {
                        setConfigOpt(prevState => {
                            return {
                                ...prevState,
                                [key]: value
                            };
                        });
                    }
                }
            }
        } else {
            dispatch(setSchema({}));
            setData("{}");
        }

    }, [generatedSchema])

    const onFileSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValidJADN(false);
        setSelectedFile(e.target.value);
        if (e.target.value == "file") {
            setGeneratedSchema('');
            ref.current.click();
        } else {
            dispatch(loadFile('schemas', e.target.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        setGeneratedSchema('');
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    let schemaObj = loadFileVal.payload.data;
                    setGeneratedSchema(schemaObj);
                    validateJADN(JSON.stringify(schemaObj));
                })
                .catch((loadFileErr) => {
                    setGeneratedSchema('');
                    sbToastError(loadFileErr.payload.data);
                })
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValidJADN(false);
        setGeneratedSchema('');
        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        setGeneratedSchema(JSON.parse(data));
                        validateJADN(data);
                    } catch (err) {
                        sbToastError(`Schema cannot be loaded: Invalid JSON`);
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsValidJADN(false);
        setSelectedFile('');
        setGeneratedSchema('');
        if (ref.current) {
            ref.current.value = '';
        }
    }

    const onValidateJADNClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        validateJADN(data);
    }

    const validateJADN = (jsonToValidate: any) => {
        dismissAllToast();
        setIsValidJADN(false);
        let jsonObj = validateJSON(jsonToValidate);
        if (!jsonObj) {
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return;
        }

        try {
            dispatch(validateSchema(jsonObj))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValidJADN(true);
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)
                })
        } catch (err) {
            if (err instanceof Error) {
                sbToastError(err.message)
            }
        }
    }

    const validateJSON = (jsonToValidate: any, onErrorReturnOrig?: boolean, showErrorPopup?: boolean) => {
        let jsonObj = null;

        if (!jsonToValidate) {
            sbToastError(`No data found`)
            return jsonObj;
        }

        try {
            jsonObj = JSON.parse(jsonToValidate);
        } catch (err: any) {
            if (showErrorPopup) {
                sbToastError(`Invalid Format: ${err.message}`)
            }
        }

        if (onErrorReturnOrig && !jsonObj) {
            jsonObj = jsonToValidate
        }

        return jsonObj;
    }

    let infoKeys;
    if (generatedSchema.info) {
        const unusedInfoKeys = Object.keys(Info).filter(k =>
            !(Object.keys(generatedSchema.info).includes(k)));

        const unusedInfo = Object.fromEntries(Object.entries(Info).filter(([key]) => unusedInfoKeys.includes(key)));

        infoKeys = Object.keys(unusedInfo).map(k => (
            <Draggable type="info" data={k} key={unusedInfo[k].key} onDragStart={selectedFile == 'file' && !generatedSchema ? (e) => e.preventDefault() : ''}>
                <ListGroupItem style={{ color: 'inherit', padding: '8px' }} action={selectedFile == 'file' && !generatedSchema ? false : true}>
                    {unusedInfo[k].key}
                    <FontAwesomeIcon icon={faGripLines} className='float-right' />
                </ListGroupItem>
            </Draggable>
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <Draggable type="info" data={k} key={Info[k].key} onDragStart={selectedFile == 'file' && !generatedSchema ? (e) => e.preventDefault() : ''}>
                <ListGroupItem style={{ color: `${selectedFile == 'file' && !generatedSchema ? 'gray' : 'inherit'}`, padding: '8px' }} action={selectedFile == 'file' && !generatedSchema ? false : true}>
                    {Info[k].key}
                    <FontAwesomeIcon icon={faGripLines} className='float-right' />
                </ListGroupItem>
            </Draggable>
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <Draggable type="types" data={k} key={Types[k].key} onDragStart={selectedFile == 'file' && !generatedSchema ? (e) => e.preventDefault() : ''}>
            <ListGroupItem style={{ color: `${selectedFile == 'file' && !generatedSchema ? 'gray' : 'inherit'}`, padding: '8px' }} action={selectedFile == 'file' && !generatedSchema ? false : true}>
                {Types[k].key}
                <FontAwesomeIcon icon={faGripLines} className='float-right' />
            </ListGroupItem>
        </Draggable>
    ));

    const onDrop = (data: any) => {
        document.getElementById('schema-editor').style.backgroundColor = '';
        if (data.info) {
            if (!generatedSchema.info) {
                let newSchema = { ...generatedSchema };
                if (data.info == 'config') {
                    newSchema = Object.assign({
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[data.info].edit(configInitialState)
                        }
                    }, newSchema);
                    setGeneratedSchema(newSchema);
                } else {
                    newSchema = Object.assign({
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[data.info].edit()
                        }
                    }, newSchema);
                    setGeneratedSchema(newSchema);
                }
            } else if (generatedSchema.info && !(data.info in generatedSchema.info)) {
                if (data.info == 'config') {
                    setGeneratedSchema((generatedSchema) => ({
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[data.info].edit(configInitialState)
                        },
                    }));
                } else {
                    setGeneratedSchema((generatedSchema) => ({
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[data.info].edit()
                        }
                    }));
                }
            }
            scrollToInfoRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });

        } else if (data.types) {
            const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            const tmpDef = Types[data.types].edit();
            tmpTypes.push(tmpDef);  // unshift drops items at the bottom
            setGeneratedSchema(generatedSchema => ({
                ...generatedSchema,
                types: tmpTypes
            }));
            scrollToTypeRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });

        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: i,
                value: key == 'config' ? configOpt :
                    generatedSchema.info[key]
                ,
                placeholder: k,
                change: val => {
                    if (key == 'config') {
                        setConfigOpt(val);
                        setGeneratedSchema(generatedSchema => ({
                            ...generatedSchema,
                            info: {
                                ...generatedSchema.info,
                                ...Info[key].edit(val)
                            }
                        }));
                    } else {
                        setGeneratedSchema(generatedSchema => ({
                            ...generatedSchema,
                            info: {
                                ...generatedSchema.info,
                                ...Info[key].edit(val)
                            }
                        }));
                    }
                },
                remove: (id: string) => {
                    if (generatedSchema.info && id in generatedSchema.info) {
                        if (id == 'config') {
                            setConfigOpt(configInitialState);
                        }
                        const tmpInfo = { ...generatedSchema.info };
                        delete tmpInfo[id];
                        //remove info if empty
                        if (Object.keys(tmpInfo).length == 0) {
                            const tmpData = { ...generatedSchema };
                            delete tmpData['info'];
                            setGeneratedSchema(tmpData);
                        } else {
                            setGeneratedSchema(generatedSchema => ({
                                ...generatedSchema,
                                info: tmpInfo
                            }));
                        }
                    }
                },
                config: configInitialState
            });
        }
        return null;
    }).filter(Boolean);

    const typesEditors = (generatedSchema.types || []).map((def, i) => {
        const type = def[1].toLowerCase() as keyof typeof Types;
        return Types[type].editor({
            key: i,
            value: def,
            dataIndex: i,
            change: (val, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);
                setGeneratedSchema(generatedSchema => ({
                    ...generatedSchema,
                    types: tmpTypes
                }))
            }
            ,
            remove: (idx: number) => {
                if (generatedSchema.types.length >= idx) {
                    const tmpTypes = [...generatedSchema.types];
                    tmpTypes.splice(idx, 1);
                    //set data, even if references is unresolved
                    //remove types if empty
                    if (tmpTypes.length == 0) {
                        const tmpData = { ...generatedSchema };
                        delete tmpData['types'];
                        setGeneratedSchema(tmpData);
                    } else {
                        setGeneratedSchema(generatedSchema => ({
                            ...generatedSchema,
                            types: tmpTypes
                        }));
                    }
                }
            },
            changeIndex: (val, dataIndex: number, idx: number) => {
                if (idx < 0) {
                    sbToastError('Error: Cannot move Type up anymore')
                    return;
                } else if (idx >= generatedSchema.types.length) {
                    sbToastError('Error: Cannot move Type down anymore')
                    return;
                }

                let tmpTypes = [...generatedSchema.types];
                tmpTypes.splice(dataIndex, 1)
                tmpTypes = [
                    ...tmpTypes.slice(0, idx),
                    Types[val.type.toLowerCase()].edit(val),
                    ...tmpTypes.slice(idx)
                ];

                setGeneratedSchema(generatedSchema => ({
                    ...generatedSchema,
                    types: tmpTypes
                }))
            },
            config: configOpt
        });
    }).filter(Boolean);

    return (
        <div className='card'>
            <div className='card-header p-2'>
                <div className='row no-gutters'>
                    <div className='col-md-3'>
                        <div className={`${selectedFile == 'file' ? ' d-none' : ''}`}>
                            <select id="schema-list" name="schema-list" className="form-control form-control-sm" value={selectedFile} onChange={onFileSelect}>
                                <option value="" disabled>Select a Schema...</option>
                                <optgroup label="Testers">
                                    {schemaOpts.map((s: any) => <option key={s} value={s} >{s}</option>)}
                                </optgroup>
                                <optgroup label="Custom">
                                    <option value="file">File...</option>
                                </optgroup>
                            </select>
                        </div>
                        <div className={`${selectedFile == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className='col-md-9'>
                        <SBCopyToClipboard buttonId='copyMessage' data={data} customClass='float-right' />
                        <SBDownloadFile buttonId='schemaDownload' customClass='float-right mr-1' data={data} />
                        <Button onClick={() => setActiveView('schema')} className={`float-right btn-sm mr-1 ${activeView == 'schema' ? ' d-none' : ''}`} color="info">View Schema</Button>
                        <Button onClick={() => setActiveView('creator')} className={`float-right btn-sm mr-1 ${activeView == 'creator' ? ' d-none' : ''}`} color="info">View Creator</Button>
                        <Button id='validateJADNButton' className="float-right btn-sm mr-1" color="info" title={isValidJADN ? "JADN schema is valid" : "Click to validate JADN"} onClick={onValidateJADNClick}>
                            <span className="m-1">Validate JADN</span>
                            {isValidJADN ? (
                                <span className="badge badge-pill badge-success">
                                    <FontAwesomeIcon icon={faCheck} />
                                </span>) : (
                                <span className="badge badge-pill badge-danger">
                                    <FontAwesomeIcon icon={faXmark} />
                                </span>)
                            }
                        </Button>
                    </div>
                </div>
            </div>
            <TabContent activeTab={activeView}>
                <TabPane tabId='creator'>
                    <div className='card'>
                        <div className='card-body p-0'>
                            <div className='row no-gutters'>
                                <div id="schema-options" className='col-sm-3'>
                                    <div className='sticky-top sticky-offset'>
                                        <Nav pills>
                                            <NavItem>
                                                <NavLink
                                                    className={activeOpt == 'info' && (selectedFile == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
                                                    disabled={selectedFile == 'file' && !generatedSchema ? true : false}
                                                    onClick={() => setActiveOpt('info')}
                                                    title="meta data (about a schema package)"
                                                >
                                                    Info
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    className={activeOpt == 'types' && (selectedFile == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
                                                    disabled={selectedFile == 'file' && !generatedSchema ? true : false}
                                                    onClick={() => setActiveOpt('types')}
                                                    title="schema content (the information model)"
                                                >
                                                    Types*
                                                </NavLink>
                                            </NavItem>
                                        </Nav>
                                        <TabContent activeTab={activeOpt}>
                                            <TabPane tabId='info'>
                                                <ListGroup>
                                                    {infoKeys.length != 0 ? infoKeys : <div className='col'>No more Info to add</div>}
                                                </ListGroup>
                                            </TabPane>
                                            <TabPane tabId='types'>
                                                <ListGroup>
                                                    {typesKeys}
                                                </ListGroup>
                                            </TabPane>
                                        </TabContent>
                                    </div>
                                </div>
                                <div id="schema-editor" className='col-md-9'>
                                    <Droppable
                                        types={['info', 'types']} // <= allowed drop types
                                        onDrop={onDrop}
                                        onDragOver={() => {
                                            document.getElementById('schema-editor').style.backgroundColor = 'rgba(0,0,0,.5)';
                                        }}
                                        onDragLeave={() => {
                                            document.getElementById('schema-editor').style.backgroundColor = '';
                                        }}
                                        className='col-12 mt-1'
                                        style={{
                                            minHeight: '20em',
                                        }}
                                    >
                                        <div className="col pt-2" ref={scrollToInfoRef}>
                                            <h5 id="info">Info <small style={{ fontSize: '10px' }} className="text-muted"> metadata </small></h5>
                                            {infoEditors}
                                        </div>
                                        <hr />
                                        <div className="col" ref={scrollToTypeRef}>
                                            <h5 id="types">Types <small style={{ fontSize: '10px' }} className="text-muted"> schema content </small></h5>
                                            {typesEditors}
                                        </div>
                                    </Droppable>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>

                <TabPane tabId='schema'>
                    <div className='card'>
                        <div className='card-body p-0'>
                            <SBEditor data={data} isReadOnly={true}></SBEditor>
                        </div>
                    </div>
                </TabPane>
            </TabContent >
        </div>
    )
}
export default SchemaCreator 