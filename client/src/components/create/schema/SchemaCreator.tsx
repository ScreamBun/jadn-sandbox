import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TabContent, TabPane, Button, ListGroup, Nav, NavItem, NavLink } from 'reactstrap'
import { Info, Types } from './structure/structure';
import { loadFile, setSchema } from 'actions/util';
import { useDispatch, useSelector } from 'react-redux';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
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
import SBSaveFile from 'components/common/SBSaveFile';
import SBSelect, { Option } from 'components/common/SBSelect';
import SBSpinner from 'components/common/SBSpinner';
import { DraggableType } from './DraggableType';
import { Droppable } from './Droppable'
import { DraggableKey } from './DraggableKey';

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
    const [fileName, setFileName] = useState('');
    const [isValidJADN, setIsValidJADN] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const schemaOpts = useSelector(getAllSchemas);
    const ref = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        setIsValidJADN(false);
        setIsValidating(false);
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

    const onFileSelect = (e: Option) => {
        dismissAllToast();
        setIsValidJADN(false);
        setGeneratedSchema('');
        setSelectedFile(e);
        if (e == null) {
            return;
        } else if (e.value == "file") {
            ref.current?.click();
        } else {
            setFileName(e.label.split('.')[0]);
            setIsLoading(true);

            dispatch(loadFile('schemas', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        setIsLoading(false);
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    setIsLoading(false);
                    let schemaObj = loadFileVal.payload.data;
                    let schemaStr = JSON.stringify(schemaObj);
                    validateJADN(schemaStr);
                    setGeneratedSchema(schemaObj);
                })
                .catch((loadFileErr) => {
                    setIsLoading(false);
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
            setIsLoading(true);
            const file = e.target.files[0];
            setSelectedFile({ 'value': file.name, 'label': file.name });
            setFileName(file.name.split('.')[0]);
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let data = ev.target.result;
                    try {
                        setIsLoading(false);
                        setGeneratedSchema(JSON.parse(data));
                        validateJADN(data);
                    } catch (err) {
                        setIsLoading(false);
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
        setIsValidating(false);
        setIsLoading(false);
        setFileName('');
        setSelectedFile(null);
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
        setIsValidating(true);
        let jsonObj = validateJSON(jsonToValidate);
        if (!jsonObj) {
            setIsValidating(false);
            sbToastError(`Invalid JSON. Cannot validate JADN`);
            return;
        }

        try {
            dispatch(validateSchema(jsonObj))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValidJADN(true);
                        setIsValidating(false);
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                    } else {
                        setIsValidating(false);
                        sbToastError(validateSchemaVal.payload.valid_msg);
                    }
                })
                .catch((validateSchemaErr) => {
                    setIsValidating(false);
                    sbToastError(validateSchemaErr.payload.valid_msg)
                })
        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
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
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={Info[k].key} id={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={Info[k].key} id={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <DraggableKey item={Types[k].key} acceptableType={'TypesKeys'} key={Types[k].key} id={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
    ));

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: i,
                value: key == 'config' ? configOpt :
                    generatedSchema.info[key]
                ,
                placeholder: k,
                change: (val: any) => {
                    if (key == 'config') {
                        setConfigOpt(val);
                        setGeneratedSchema((generatedSchema: { info: any; }) => ({
                            ...generatedSchema,
                            info: {
                                ...generatedSchema.info,
                                ...Info[key].edit(val)
                            }
                        }));
                    } else {
                        setGeneratedSchema((generatedSchema: { info: any; }) => ({
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
                            setGeneratedSchema((generatedSchema: any) => ({
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
    });

    const onDrag = useCallback((val, dragIndex: number, hoverIndex: number) => {
        console.log(generatedSchema.types, dragIndex, hoverIndex)
        const type = val.type.toLowerCase() as keyof typeof Types;
        const dragItem = Types[type].edit(val); //generatedSchema.types[dragIndex]; //
        const hoverItem = generatedSchema.types[hoverIndex];
        console.log("REPLACING : " + dragItem + " WITH " + hoverItem)

        // let tmpTypes = [...generatedSchema.types];
        // tmpTypes.splice(dragIndex, 1);
        // tmpTypes.splice(hoverIndex, 0, Types[type].edit(val));

        setGeneratedSchema((generatedSchema: any) => {
            const tmpTypes = [...generatedSchema.types];
            tmpTypes[dragIndex] = hoverItem
            tmpTypes[hoverIndex] = dragItem
            return ({ ...generatedSchema, types: tmpTypes })
        })
    }, [generatedSchema])

    const typesEditors = (generatedSchema.types || []).map((def, i) => {
        const type = def[1].toLowerCase() as keyof typeof Types;
        return (<DraggableType acceptableType={'Types'}
            key={i}
            id={i}
            changeIndex={onDrag}
            item={Types[type].editor({
                key: i,
                value: def,
                dataIndex: i,
                change: (val, idx: number) => {
                    const tmpTypes = [...generatedSchema.types];
                    tmpTypes[idx] = Types[type].edit(val);
                    setGeneratedSchema((generatedSchema: any) => ({
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
                            setGeneratedSchema((generatedSchema: any) => ({
                                ...generatedSchema,
                                types: tmpTypes
                            }));
                        }
                    }
                },
                changeIndex: (val, dataIndex: number, idx: number) => {
                    const type = val.type.toLowerCase() as keyof typeof Types;
                    if (idx < 0) {
                        sbToastError('Error: Cannot move Type up anymore');
                        return;
                    } else if (idx >= generatedSchema.types.length) {
                        sbToastError('Error: Cannot move Type down anymore');
                        return;
                    }

                    let tmpTypes = [...generatedSchema.types];

                    tmpTypes = tmpTypes.filter((_t, i) => i !== dataIndex);

                    tmpTypes = [
                        ...tmpTypes.slice(0, idx),
                        Types[type].edit(val),
                        ...tmpTypes.slice(idx)
                    ];

                    setGeneratedSchema((generatedSchema: any) => ({
                        ...generatedSchema,
                        types: tmpTypes
                    }));
                },
                config: configOpt
            })} />)
    });

    const onDrop = (key: string) => {
        console.log("ON DROP CALLED")
        if (Object.keys(Info).includes(key)) {
            if (!generatedSchema.info) {
                let newSchema = { ...generatedSchema };
                if (key == 'config') {
                    newSchema = Object.assign({
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[key].edit(configInitialState)
                        }
                    }, newSchema);
                    setGeneratedSchema(newSchema);
                } else {
                    newSchema = Object.assign({
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[key].edit()
                        }
                    }, newSchema);
                    setGeneratedSchema(newSchema);
                }
            } else if (generatedSchema.info && !(key in generatedSchema.info)) {
                if (key == 'config') {
                    setGeneratedSchema((generatedSchema: any) => ({
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[key].edit(configInitialState)
                        },
                    }));
                } else {
                    setGeneratedSchema((generatedSchema) => ({
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info || {},
                            ...Info[key].edit()
                        }
                    }));
                }
            }
        } else if (Object.keys(Types).includes(key)) {
            const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            const tmpDef = Types[key].edit();
            tmpTypes.push(tmpDef);  // unshift drops items at the bottom
            setGeneratedSchema((generatedSchema: any) => ({
                ...generatedSchema,
                types: tmpTypes
            }));
        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    return (
        <div className='card'>
            <div className='card-header p-2'>
                <div className='row no-gutters'>
                    <div className='col-sm-3'>
                        <div className={`${selectedFile?.value == 'file' ? ' d-none' : ''}`}>
                            <div className="input-group">
                                <SBSelect id={"schema-list"}
                                    data={schemaOpts}
                                    onChange={onFileSelect}
                                    placeholder={'Select a schema...'}
                                    loc={'schemas'}
                                    value={selectedFile}
                                    isGrouped isFileUploader />
                                <div className="input-group-btn ml-1">
                                    <SBSaveFile
                                        buttonId={'saveSchema'}
                                        toolTip={'Save Schema'}
                                        data={data}
                                        loc={'schemas'}
                                        filename={fileName}
                                        setDropdown={onFileSelect} />
                                </div>
                            </div>
                        </div>
                        <div className={`${selectedFile?.value == 'file' ? '' : ' d-none'}`} style={{ display: 'inline' }}>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className='col-sm-9'>
                        <SBCopyToClipboard buttonId='copyMessage' data={data} customClass={'float-right'} />
                        <SBDownloadFile buttonId='schemaDownload' filename={fileName} data={data} customClass={'float-right mr-1'} />
                        <Button onClick={() => setActiveView('schema')} className={`float-right btn-sm mr-1 ${activeView == 'schema' ? ' d-none' : ''}`} color="primary" title="View in JSON">View JSON</Button>
                        <Button onClick={() => setActiveView('creator')} className={`float-right btn-sm mr-1 ${activeView == 'creator' ? ' d-none' : ''}`} color="primary" title="View via Input Form">View Form</Button>
                        {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <Button id='validateJADNButton' className="float-right btn-sm mr-1" color="primary" title={isValidJADN ? "JADN is valid" : "Validate JADN"} onClick={onValidateJADNClick}>
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
                        }
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
                                                    className={activeOpt == 'info' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
                                                    disabled={selectedFile?.value == 'file' && !generatedSchema ? true : false}
                                                    onClick={() => setActiveOpt('info')}
                                                    title="meta data (about a schema package)"
                                                >
                                                    Info
                                                </NavLink>
                                            </NavItem>
                                            <NavItem>
                                                <NavLink
                                                    className={activeOpt == 'types' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
                                                    disabled={selectedFile?.value == 'file' && !generatedSchema ? true : false}
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
                                    {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                        <div>
                                            <div className="col pt-2">
                                                <h5 id="info">Info <small style={{ fontSize: '10px' }} className="text-muted"> metadata </small></h5>
                                                <Droppable onDrop={onDrop} acceptableType={'InfoKeys'} >
                                                    {infoEditors}
                                                </Droppable>

                                            </div>
                                            <hr />
                                            <div className="col">
                                                <h5 id="types">Types <small style={{ fontSize: '10px' }} className="text-muted"> schema content </small></h5>
                                                <Droppable onDrop={onDrop} acceptableType={"TypesKeys"} >
                                                    {typesEditors}
                                                </Droppable>

                                            </div>
                                        </div>
                                    }
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