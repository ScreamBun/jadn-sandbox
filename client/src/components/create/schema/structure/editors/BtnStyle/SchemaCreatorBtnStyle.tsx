import React, { useEffect, memo, useRef, useState } from 'react'
import { TabContent, TabPane, Button, ListGroup, Nav, NavItem, NavLink } from 'reactstrap'
import { Info, Types } from '../../structure';
import { loadFile, setSchema } from 'actions/util';
import { useDispatch, useSelector } from 'react-redux';
import { faCheck, faCircleChevronDown, faCircleChevronUp, faPlusSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import { getAllSchemas } from 'reducers/util';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBEditor from 'components/common/SBEditor';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import SBDownloadFile from 'components/common/SBDownloadFile';
import SBFileUploader from 'components/common/SBFileUploader';
import { validateSchema } from 'actions/validate';
import SBSaveFile from 'components/common/SBSaveFile';
import SBSelect, { Option } from 'components/common/SBSelect';
import SBSpinner from 'components/common/SBSpinner';
import { flushSync } from 'react-dom';
import SBScrollToTop from 'components/common/SBScrollToTop';
import { getFilenameOnly } from 'components/utils/general';
import SBOutlineBtnStyle from 'components/create/schema/outline/SBOutlineBtnStyle';
import { TypeObject } from '../consts';
const configInitialState = {
    $MaxBinary: $MAX_BINARY,
    $MaxString: $MAX_STRING,
    $MaxElements: $MAX_ELEMENTS,
    $Sys: $SYS,
    $TypeName: $TYPENAME,
    $FieldName: $FIELDNAME,
    $NSID: $NSID
}

const defaultInsertIdx = { label: "end", value: "end" };

const SchemaCreatorBtnStyle = memo(function SchemaCreator(props: any) {
    const dispatch = useDispatch();
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema } = props;

    useEffect(() => {
        dispatch(setSchema(generatedSchema));
    }, [generatedSchema])

    const [configOpt, setConfigOpt] = useState(configInitialState);
    const [fileName, setFileName] = useState('');
    const [isValidJADN, setIsValidJADN] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const [infoCollapse, setInfoCollapse] = useState(false);
    const [typesCollapse, setTypesCollapse] = useState(false);
    const [allFieldsCollapse, setAllFieldsCollapse] = useState(false);
    const [insertAt, setInsertAt] = useState(defaultInsertIdx);
    const indexOpts = generatedSchema.types ? generatedSchema.types.map((_item: any, i: number) => {
        if (i == 0) {
            return { value: "beginning", label: "beginning" };
        } else if (i == (generatedSchema.types.length - 1)) {
            return { value: "end", label: "end" }
        } else {
            return { value: `${i}`, label: `index: ${i}` };
        }
    }) : [defaultInsertIdx];
    const schemaOpts = useSelector(getAllSchemas);
    const ref = useRef<HTMLInputElement | null>(null);
    const scrollToInfoRef = useRef<HTMLInputElement | null>(null);


    const onFileSelect = (e: Option) => {
        dismissAllToast();
        setIsValidJADN(false);
        setIsValidating(false);
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
        setIsValidating(false);
        setGeneratedSchema('');
        if (e.target.files && e.target.files.length != 0) {
            setIsLoading(true);
            const file = e.target.files[0];
            setSelectedFile({ 'value': file.name, 'label': file.name });

            const filename_only = getFilenameOnly(file.name);
            setFileName(filename_only);

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
        validateJADN(JSON.stringify(generatedSchema));
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
            <div className='list-group-item p-2' key={k}>
                {Info[k].key}

                <Button color="info" onClick={() => onDrop(k)} outline className='float-right btn btn-sm'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </Button>
            </div>
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <div className='list-group-item p-2' key={k}>
                {Info[k].key}

                <Button color="info" onClick={() => onDrop(k)} outline className='float-right btn btn-sm'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </Button>
            </div>
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <div className='list-group-item p-2' key={k}>
            {Types[k].key}

            <Button color="info" onClick={() => onDrop(k)} outline className='float-right btn btn-sm'
                disabled={selectedFile?.value == 'file' ? true : false}
                title='Add to Schema'>
                <FontAwesomeIcon icon={faPlusSquare} />
            </Button>
        </div>
    ));

    const get_type_name = (types_to_serach: any[], name: string) => {
        let return_name = name;
        let match_count = 0;
        let dups: any[] = [];
        types_to_serach.map((type) => {

            // orig name matches
            if (name == type[0]) {
                match_count = match_count + 1;
            } else {
                // dup matches
                var lastIndex = type[0].lastIndexOf('-');

                if (lastIndex) {

                    let dup_name = type[0].substr(0, lastIndex);

                    if (name == dup_name) {

                        let dup_num = type[0].substr(lastIndex).substring(1);

                        if (dup_num && !isNaN(dup_num)) {

                            dups.push(dup_num);
                            match_count = match_count + 1;

                        }
                    }
                }
            }

        });

        if (match_count > 0) {

            if (dups.length == 0) {
                return_name = return_name + "-" + (dups.length + 1);
            } else {
                dups.sort(function (a, b) { return b - a });  // TODO: Move to utils
                let next_num = parseInt(dups[0]) + 1;
                return_name = return_name + "-" + next_num;
            }

        }

        return return_name;
    }
    const onSelectChange = (e: Option) => {
        if (e == null || parseInt(e.value) < 0 || parseInt(e.value) > generatedSchema.types.length) {
            sbToastError("Invalid Index. Setting index to default: end.")
            e = defaultInsertIdx;
        }
        setInsertAt(e);
    }

    const onDrop = (key: string) => {
        if (Object.keys(Info).includes(key)) {
            let updatedSchema;
            if (key == 'config') {
                updatedSchema = {
                    ...generatedSchema,
                    info: {
                        ...generatedSchema.info || {},
                        ...Info[key].edit(configInitialState)
                    },
                }

            } else {
                updatedSchema = {
                    ...generatedSchema,
                    info: {
                        ...generatedSchema.info || {},
                        ...Info[key].edit()
                    },
                }
            }
            flushSync(() => {
                setGeneratedSchema(updatedSchema);
            });
            setIsValidJADN(false);
            setIsValidating(false);
            scrollToInfoRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: "center" });

        } else if (Object.keys(Types).includes(key)) {
            let tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            const type_name = get_type_name(tmpTypes, `${Types[key].key}-Name`);
            const tmpDef = Types[key].edit({ name: type_name });

            if (insertAt.value == "beginning") {
                tmpTypes.unshift(tmpDef);

            } else if (insertAt.value == "end") {
                tmpTypes.push(tmpDef);

            } else {
                const idx = parseInt(insertAt.value);
                tmpTypes = [
                    ...tmpTypes.slice(0, idx),
                    tmpDef,
                    ...tmpTypes.slice(idx)
                ];
            }

            let updatedSchema = {
                ...generatedSchema,
                types: tmpTypes
            };
            flushSync(() => {
                setGeneratedSchema(updatedSchema);
            });
            setIsValidJADN(false);
            setIsValidating(false);

        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const onOutlineClick = (e: React.MouseEvent<HTMLElement>, text: string) => {
        e.preventDefault();
        const element = document.getElementById(text);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const changeIndex = (val: TypeObject, dataIndex: number, idx: number) => {
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

        let updatedSchema = {
            ...generatedSchema,
            types: tmpTypes
        };
        setGeneratedSchema(updatedSchema);
        setIsValidJADN(false);
        setIsValidating(false);
    }

    const infoEditors = Object.keys(Info).map((k, i) => {
        const key = k as keyof typeof Info;
        if (generatedSchema.info && k in generatedSchema.info) {
            return Info[key].editor({
                key: self.crypto.randomUUID(),
                value: generatedSchema.info[key],
                dataIndex: i,
                placeholder: k,
                change: (val: any) => {
                    if (key == 'config') {
                        setConfigOpt(val);
                    }
                    let updatedSchema = {
                        ...generatedSchema,
                        info: {
                            ...generatedSchema.info,
                            ...Info[key].edit(val)
                        }
                    };

                    setGeneratedSchema(updatedSchema);
                    setIsValidJADN(false);
                    setIsValidating(false);

                },
                remove: (id: string) => {
                    if (generatedSchema.info && id in generatedSchema.info) {
                        if (id == 'config') {
                            setConfigOpt(configInitialState);
                        }
                        const tmpInfo = { ...generatedSchema.info };
                        delete tmpInfo[id];
                        let updatedSchema;
                        //remove info if empty
                        if (Object.keys(tmpInfo).length == 0) {
                            const tmpData = { ...generatedSchema };
                            delete tmpData['info'];
                            updatedSchema = tmpData;
                        } else {
                            updatedSchema = {
                                ...generatedSchema,
                                info: tmpInfo
                            };
                        }
                        setGeneratedSchema(updatedSchema);
                        setIsValidJADN(false);
                        setIsValidating(false);
                    }
                },
                config: configInitialState
            });
        }
        return null;
    });

    const typesEditors = (generatedSchema.types || []).map((def, i) => {
        let type = def[1].toLowerCase() as keyof typeof Types;

        //CHECK FOR VALID TYPE
        if (!Object.keys(Types).includes(type)) {
            sbToastError(`Error: ${type} in Type definition [${def}] is not a valid type. Changing type to String.`)
            def[1] = "String";
            type = "string";
        }

        return (Types[type].editorBtnStyle({
            key: self.crypto.randomUUID(),
            value: def,
            dataIndex: i,
            collapseAllFields: allFieldsCollapse,
            change: (val, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);
                let updatedSchema = {
                    ...generatedSchema,
                    types: tmpTypes
                };
                setGeneratedSchema(updatedSchema);
                setIsValidJADN(false);
                setIsValidating(false);
            }
            ,
            remove: (idx: number) => {
                if (generatedSchema.types.length >= idx) {
                    const tmpTypes = [...generatedSchema.types];
                    tmpTypes.splice(idx, 1);
                    //remove types if empty
                    let updatedSchema;
                    if (tmpTypes.length == 0) {
                        const tmpData = { ...generatedSchema };
                        delete tmpData['types'];
                        updatedSchema = tmpData;
                    } else {
                        updatedSchema = {
                            ...generatedSchema,
                            types: tmpTypes
                        };
                    }
                    setGeneratedSchema(updatedSchema);
                    setIsValidJADN(false);
                    setIsValidating(false);
                }
            },
            config: configOpt
        }))
    }).filter(Boolean);

    return (
        <div className='card'>
            <div className='card-header p-2'>
                <div className='row no-gutters'>
                    <div className='col-sm-3'>
                        <div className={`${selectedFile?.value == 'file' ? ' d-none' : ''}`}>
                            <div className="input-group flex-nowrap">
                                <SBSelect id={"schema-list"}
                                    data={schemaOpts}
                                    onChange={onFileSelect}
                                    placeholder={'Select a schema...'}
                                    loc={'schemas'}
                                    value={selectedFile}
                                    isSmStyle
                                    isGrouped isFileUploader />
                                <div className="input-group-btn ml-1">
                                    <SBSaveFile
                                        buttonId={'saveSchema'}
                                        toolTip={'Save Schema'}
                                        data={generatedSchema}
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
                        <SBCopyToClipboard buttonId='copyMessage' data={generatedSchema} customClass={'float-right'} />
                        <SBDownloadFile buttonId='schemaDownload' filename={fileName} data={generatedSchema} customClass={'float-right mr-1'} />
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
            <div className='card-body p-2'>
                <TabContent activeTab={activeView}>
                    <TabPane tabId='creator'>
                        <div className='row'>
                            <div id="schema-options" className='col-sm-3 pr-1 card-body-scroller'>
                                <div className='row'>
                                    <div className='col'>
                                        <Nav pills className='pb-2'>
                                            <NavItem className='mr-2'>
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
                                        <TabContent className='mb-2' activeTab={activeOpt}>
                                            <TabPane tabId='info'>
                                                <ListGroup>
                                                    {infoKeys.length != 0 ? infoKeys : <div className='col'>No Info to add</div>}
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
                                <div className='row mt-2'>
                                    <div className='col'>
                                        <ul className="nav nav-pills">
                                            <li className="nav-item pb-0 mb-2">
                                                <a className="active nav-link" title='Enter numeric index to specify where to insert Type'>
                                                    Insert Type at index
                                                </a>
                                            </li>
                                        </ul>
                                        <SBSelect id="addAtIndex" name="addAtIndex" value={insertAt}
                                            placeholder="Select index to insert Types"
                                            isClearable={false}
                                            onChange={onSelectChange} data={indexOpts}
                                        />
                                        <small className='text-muted'>
                                            (Default: end)
                                        </small>
                                    </div>
                                </div>
                                <div className='row mt-2'>
                                    <div className='col'>
                                        <SBOutlineBtnStyle id={'schema-outline'}
                                            items={generatedSchema.types}
                                            title={'Outline'}
                                            onClick={onOutlineClick}
                                            changeIndex={changeIndex}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div id="schema-editor" className='col-md-9 px-2 card-body-scroller'>
                                {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                    <>
                                        <div className='row'>
                                            <div className="col pt-2">
                                                <div className='card border-secondary'>
                                                    <div className='card-header bg-primary'>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h6 id="info" className='mb-0'>Info <small style={{ fontSize: '10px' }}> metadata </small></h6>
                                                            </div>
                                                            <div className='col'>
                                                                <legend>
                                                                    <FontAwesomeIcon icon={infoCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                        className='float-right btn btn-sm text-light'
                                                                        onClick={() => setInfoCollapse(!infoCollapse)}
                                                                        title={infoCollapse ? ' Show Info' : ' Hide Info'} />
                                                                </legend>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='card-body'>
                                                        {!infoCollapse &&
                                                            <div ref={scrollToInfoRef}>
                                                                {generatedSchema.info ?
                                                                    <>{infoEditors}</>
                                                                    :
                                                                    <><p>To add metadata info make a selection from Info</p></>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row mt-2'>
                                            <div className="col pt-2">
                                                <div className='card border-secondary'>
                                                    <div className='card-header bg-primary'>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h6 id="types" className='mb-0 pt-1'>Types* <small style={{ fontSize: '10px' }}> schema content </small></h6>
                                                            </div>
                                                            <div className='col'>
                                                                {generatedSchema.types &&
                                                                    <>
                                                                        <div className="btn-group btn-group-sm float-right" role="group" aria-label="Basic example">
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setTypesCollapse(!typesCollapse)}>
                                                                                {typesCollapse ? 'Show Types' : ' Hide Types'}
                                                                                <FontAwesomeIcon icon={typesCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-right btn btn-sm'
                                                                                    title={typesCollapse ? 'Show Types' : 'Hide Types'} />
                                                                            </button>
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setAllFieldsCollapse(!allFieldsCollapse)}>
                                                                                {allFieldsCollapse ? 'Show Fields' : 'Hide Fields'}
                                                                                <FontAwesomeIcon icon={allFieldsCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-right btn btn-sm'
                                                                                    title={allFieldsCollapse ? 'Show Fields' : 'Hide Fields'} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='card-body'>
                                                        {!typesCollapse &&
                                                            <div>
                                                                {generatedSchema.types ?
                                                                    <>{typesEditors}</>
                                                                    :
                                                                    <><p>To add schema content make a selection from Types</p></>
                                                                }
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </TabPane>

                    <TabPane tabId='schema'>
                        <div className='card'>
                            <div className='card-body p-0'>
                                <SBEditor data={generatedSchema} isReadOnly={true}></SBEditor>
                            </div>
                        </div>
                    </TabPane>
                    <SBScrollToTop divID='schema-editor' />
                </TabContent >
            </div>
        </div>
    )
});
export default SchemaCreatorBtnStyle 