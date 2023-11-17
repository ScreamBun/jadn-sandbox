import React, { useEffect, memo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { flushSync } from 'react-dom';
import { faCheck, faXmark, faCircleChevronDown, faCircleChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { v4 as uuid4 } from 'uuid';
import { Info, Types } from '../../structure';
import { loadFile, setSchema } from 'actions/util';
import { validateSchema } from 'actions/validate';
import { getAllSchemas } from 'reducers/util';
import { getFilenameOnly } from 'components/utils/general';
import { StandardTypeArray, TypeArray } from 'components/create/schema/interface';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import { TypeObject } from '../consts';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBEditor from 'components/common/SBEditor';
import SBDownloadFile from 'components/common/SBDownloadFile';
import SBFileUploader from 'components/common/SBFileUploader';
import SBSaveFile from 'components/common/SBSaveFile';
import SBSelect, { Option } from 'components/common/SBSelect';
import SBSpinner from 'components/common/SBSpinner';
import SBScrollToTop from 'components/common/SBScrollToTop';
import SBOutline, { DragItem, DragItem as Item } from './SBOutline';
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

const SchemaCreator = memo(function SchemaCreator(props: any) {
    const dispatch = useDispatch();
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState } = props;

    useEffect(() => {
        if (!generatedSchema) {
            setIsValidJADN(false);
        }
        dispatch(setSchema(generatedSchema));
    }, [generatedSchema])

    const [configOpt, setConfigOpt] = useState(configInitialState);
    const [fileName, setFileName] = useState('');
    const [isValidJADN, setIsValidJADN] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [activeView, setActiveView] = useState('creator');
    const [activeOpt, setActiveOpt] = useState('info');
    const [visibleType, setVisibleType] = useState<number | null>(null);

    const [allFieldsCollapse, setAllFieldsCollapse] = useState(false);
    const [infoCollapse, setInfoCollapse] = useState(false);
    const [typesCollapse, setTypesCollapse] = useState(false);

    const schemaOpts = useSelector(getAllSchemas);
    const ref = useRef<HTMLInputElement | null>(null);

    const onFileSelect = (e: Option) => {
        dismissAllToast();
        setIsValidJADN(false);
        setIsValidating(false);
        if (e == null) {
            setSelectedFile(e);
            setGeneratedSchema('');
            setCardsState([]);
            return;
        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();
        } else {
            setSelectedFile(e);
            setFileName(e.label.split('.')[0]);
            setIsLoading(true);

            dispatch(loadFile('schemas', e.value))
                .then((loadFileVal: { error: any; payload: { response: string; data: any; }; }) => {
                    if (loadFileVal.error) {
                        setIsLoading(false);
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    setIsLoading(false);
                    let schemaObj = loadFileVal.payload.data;
                    let schemaStr = JSON.stringify(schemaObj);

                    validateJADN(schemaStr);
                    flushSync(() => {
                        setGeneratedSchema(schemaObj);
                        setCardsState(schemaObj.types.map((item, i) => ({
                            id: self.crypto.randomUUID(),
                            index: i,
                            text: item[0],
                            value: item,
                            isStarred: false
                        })));

                    });

                })
                .catch((loadFileErr: { payload: { data: string; }; }) => {
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
                        const dataObj = JSON.parse(data);
                        const validJADN = validateJADN(data);
                        if (validJADN) {
                            flushSync(() => {
                                setGeneratedSchema(dataObj);
                                setCardsState(dataObj.types.map((item, i) => ({
                                    id: self.crypto.randomUUID(),
                                    index: i,
                                    text: item[0],
                                    value: item,
                                    isStarred: false
                                })));
                            });
                        }
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
        setCardsState([]);
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
            return false;
        }

        try {
            dispatch(validateSchema(jsonObj))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        setIsValidJADN(true);
                        setIsValidating(false);
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        return true;
                    } else {
                        setIsValidating(false);
                        sbToastError(validateSchemaVal.payload.valid_msg);
                        return false;
                    }
                })
                .catch((validateSchemaErr: { payload: { valid_msg: string; }; }) => {
                    setIsValidating(false);
                    sbToastError(validateSchemaErr.payload.valid_msg)
                    return false;
                })
        } catch (err) {
            if (err instanceof Error) {
                setIsValidating(false);
                sbToastError(err.message)
                return false;
            }
        }
        return false;
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

    const onSchemaDrop = (item: Item) => {
        let key = item.text;
        if (Object.keys(Info).includes(key)) {
            const edit = key == 'config' ? Info[key].edit(configInitialState) : Info[key].edit();
            const updatedSchema = generatedSchema.types ? {
                info: {
                    ...generatedSchema.info || {},
                    ...edit
                },
                types: [...generatedSchema.types]
            } :
                {
                    info: {
                        ...generatedSchema.info || {},
                        ...edit
                    },
                }

            flushSync(() => {
                setGeneratedSchema(updatedSchema);
            });
            setIsValidJADN(false);
            setIsValidating(false);

            var scrollSpyContentEl = document.getElementById(`${key}`)
            scrollSpyContentEl?.scrollIntoView({ block: 'end' });

        } else if (Object.keys(Types).includes(key)) {
            const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            const type_name = get_type_name(tmpTypes, `${Types[key].key}-Name`);
            const tmpDef = Types[key].edit({ name: type_name });
            tmpTypes.push(tmpDef);
            const dataIndex = generatedSchema.types?.length || 0;

            const new_card = {
                id: self.crypto.randomUUID(),
                index: dataIndex,
                text: type_name,
                value: tmpDef,
                isStarred: false
            }

            flushSync(() => {
                setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                setCardsState((prev: any) => ([...prev, new_card]));
            });

            setIsValidJADN(false);
            setIsValidating(false);

            var scrollSpyContentEl = document.getElementById(`${dataIndex}`)
            scrollSpyContentEl?.scrollIntoView({ block: 'end' });

        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const onOutlineDrop = (updatedCards: DragItem[]) => {
        const updatedTypes = updatedCards.map(item => item.value);
        setGeneratedSchema((prev: any) => ({ ...prev, types: updatedTypes }));
        setCardsState(updatedCards);
    };

    const onStarClick = (updatedCards: DragItem[]) => {
        setCardsState(updatedCards);
    }

    const onTypesToOutlineDrop = (item: any) => {
        let key = item.text;
        let insertAt = item.index;
        const tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
        const type_name = get_type_name(tmpTypes, `${Types[key].key}-Name`);
        const tmpDef = Types[key].edit({ name: type_name });

        let updatedTypes = [
            ...tmpTypes.slice(0, insertAt),
            tmpDef,
            ...tmpTypes.slice(insertAt)
        ];

        const new_card = {
            id: self.crypto.randomUUID(),
            index: insertAt,
            text: type_name,
            value: tmpDef,
            isStarred: false
        }

        let updatedCards = [
            ...cardsState.slice(0, insertAt),
            new_card,
            ...cardsState.slice(insertAt)
        ];

        flushSync(() => {
            setGeneratedSchema((prev: any) => ({ ...prev, ['types']: updatedTypes }));
            setCardsState(updatedCards);
        });

        setIsValidating(false);

        var scrollSpyContentEl = document.getElementById(`${insertAt}`)
        scrollSpyContentEl?.scrollIntoView({ block: 'end' });
    }

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

    let infoKeys;
    if (generatedSchema.info) {
        const unusedInfoKeys = Object.keys(Info).filter(k =>
            !(Object.keys(generatedSchema.info).includes(k)));

        const unusedInfo = Object.fromEntries(Object.entries(Info).filter(([key]) => unusedInfoKeys.includes(key)));

        infoKeys = Object.keys(unusedInfo).map(k => (
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={uuid4()} id={uuid4()} index={-1} text={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <DraggableKey item={Info[k].key} acceptableType={'InfoKeys'} key={uuid4()} id={uuid4()} index={-1} text={k} isDraggable={selectedFile?.value == 'file' ? false : true} />
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <DraggableKey item={Types[k].key} acceptableType={'TypesKeys'} key={uuid4()} id={uuid4()} index={-1} text={k}
            isDraggable={selectedFile?.value == 'file' ? false : true} onTypesDrop={onTypesToOutlineDrop}
        />
    ));

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

                    setGeneratedSchema((prev: any) => ({
                        ...prev,
                        info: {
                            ...prev.info,
                            ...Info[key].edit(val)
                        }
                    }));

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
                config: generatedSchema.info[key] ? generatedSchema.info[key] : configInitialState
            });
        }
        return null;
    });

    const typesEditors = (generatedSchema.types || []).map((def: StandardTypeArray, i: any) => {
        let type = def[1].toLowerCase() as keyof typeof Types;

        //CHECK FOR VALID TYPE
        if (!Object.keys(Types).includes(type)) {
            sbToastError(`Error: ${type} in Type definition [${def}] is not a valid type. Changing type to String.`)
            def[1] = "String";
            type = "string";
        }

        return (Types[type].editor({
            key: self.crypto.randomUUID(),
            value: def,
            dataIndex: i,
            collapseAllFields: allFieldsCollapse,
            setIsVisible: setVisibleType,
            change: (val: TypeObject, idx: number) => {
                const tmpTypes = [...generatedSchema.types];
                tmpTypes[idx] = Types[val.type.toLowerCase()].edit(val);

                const valArray: TypeArray = Object.values(val);
                const updatedCards = cardsState.map((card, i) => {
                    if (i === idx) {
                        return ({
                            ...card,
                            text: val.name,
                            value: valArray
                        });
                    } else {
                        return card;
                    }
                });

                setGeneratedSchema((prev: any) => ({
                    ...prev,
                    types: tmpTypes
                }));
                setCardsState(updatedCards);
                setIsValidJADN(false);
                setIsValidating(false);
            }
            ,
            remove: (idx: number) => {
                const tmpTypes = generatedSchema.types.filter((_type: StandardTypeArray, i: number) => i != idx);
                const tmpCards = cardsState.filter((_card: DragItem, index: number) => index != idx);
                if (tmpTypes.length != 0) {
                    setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
                } else {
                    if (generatedSchema.info) {
                        setGeneratedSchema((prev: any) => ({ ...prev.info }));
                    } else {
                        setGeneratedSchema({});
                    }
                }
                setCardsState(tmpCards);
                setIsValidJADN(false);
                setIsValidating(false);
            },
            config: configOpt
        }))
    }).filter(Boolean);

    return (
        <div className='card'>
            <div className='card-header p-2'>
                <div className='row no-gutters'>
                    <div className='col-sm-3'>
                        <div className="d-flex">
                            <SBSelect id={"schema-list"}
                                data={schemaOpts}
                                onChange={onFileSelect}
                                placeholder={'Select a schema...'}
                                loc={'schemas'}
                                value={selectedFile}
                                isSmStyle
                                isGrouped isFileUploader />
                            <SBSaveFile
                                buttonId={'saveSchema'}
                                toolTip={'Save Schema'}
                                customClass={"float-end ms-1"}
                                data={generatedSchema}
                                loc={'schemas'}
                                filename={fileName}
                                setDropdown={setSelectedFile} />
                        </div>
                        <div className='d-none'>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className='col-sm-9'>
                        <SBCopyToClipboard buttonId='copyMessage' data={generatedSchema} customClass={'float-end'} />
                        <SBDownloadFile buttonId='schemaDownload' filename={fileName} data={generatedSchema} customClass={'float-end me-1'} />
                        <button type='button' onClick={() => setActiveView('schema')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'schema' ? ' d-none' : ''}`} title="View in JSON">View JSON</button>
                        <button type='button' onClick={() => setActiveView('creator')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'creator' ? ' d-none' : ''}`} title="View via Input Form">View Form</button>
                        {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <button type='button' id='validateJADNButton' className="float-end btn btn-primary btn-sm me-1" title={isValidJADN ? "JADN is valid" : "Validate JADN"} onClick={onValidateJADNClick}>
                                <span className="m-1">Validate JADN</span>
                                {isValidJADN ? (
                                    <span className="badge rounded-pill text-bg-success">
                                        <FontAwesomeIcon icon={faCheck} />
                                    </span>) : (
                                    <span className="badge rounded-pill text-bg-danger">
                                        <FontAwesomeIcon icon={faXmark} />
                                    </span>)
                                }
                            </button>
                        }
                    </div>
                </div>
            </div>
            <div className='card-body p-2'>
                <div className='tab-content mb-2'>
                    <div className={`container-fluid tab-pane fade ${activeView == 'creator' ? 'show active' : ''}`} id="creator" role="tabpanel" aria-labelledby="creator-tab" tabIndex={0}>
                        <div className='row'>
                            <div id="schema-options" className='col-sm-3 ps-0 card-body-scroller'>
                                <div className='row'>
                                    <div className='col'>
                                        <ul className="nav nav-pills pb-2" id="editorKeys" role="tablist">
                                            <li className='nav-item me-2'>
                                                <a
                                                    className={`nav-link 
                                                    ${activeOpt == 'info' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                    onClick={() => setActiveOpt('info')}
                                                    title="meta data (about a schema package)"
                                                    data-bs-toggle="pill"
                                                >
                                                    Info
                                                </a>
                                            </li>
                                            <li className='nav-item'>
                                                <a
                                                    className={`nav-link 
                                                    ${activeOpt == 'types' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active bg-primary' : ''}
                                                    ${selectedFile?.value == 'file' && !generatedSchema ? 'disabled' : ''}`}
                                                    onClick={() => setActiveOpt('types')}
                                                    title="schema content (the information model)"
                                                    data-bs-toggle="pill"
                                                >
                                                    Types*
                                                </a>
                                            </li>
                                        </ul>
                                        <div className='tab-content mb-2'>
                                            <div className={`tab-pane fade ${activeOpt == 'info' ? 'show active' : ''}`} id="info" role="tabpanel" aria-labelledby="info-tab" tabIndex={0}>
                                                <ul className="list-group">
                                                    {infoKeys.length != 0 ? infoKeys : <div className='col'>No Info to add</div>}
                                                </ul>
                                            </div>
                                            <div className={`tab-pane fade ${activeOpt == 'types' ? 'show active' : ''}`} id="types" role="tabpanel" aria-labelledby="types-tab" tabIndex={0}>
                                                <ul className="list-group">
                                                    {typesKeys}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col'>
                                        <SBOutline
                                            id={'schema-outline'}
                                            cards={cardsState}
                                            title={'Outline'}
                                            onDrop={onOutlineDrop}
                                            onStarToggle={onStarClick}
                                            visibleCard={visibleType}
                                        ></SBOutline>
                                    </div>
                                </div>
                            </div>
                            <div id="schema-editor" className='col-md-9 px-1 card-body-scroller' >
                                {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                    <>
                                        <div className='row'>
                                            <div className="col">
                                                <div className='card'>
                                                    <div className='card-header text-light bg-primary' style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h5 id="info" className="card-title text-light">Info <small style={{ fontSize: '10px' }}> metadata </small></h5>
                                                            </div>
                                                            <div className='col'>
                                                                <span>
                                                                    <FontAwesomeIcon icon={infoCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                        className='float-end btn btn-sm text-light'
                                                                        onClick={() => setInfoCollapse(!infoCollapse)}
                                                                        title={infoCollapse ? ' Show Info' : ' Hide Info'} />
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='card-body'>
                                                        {!infoCollapse &&
                                                            <Droppable onDrop={onSchemaDrop} acceptableType={'InfoKeys'} >
                                                                {generatedSchema.info ?
                                                                    <>{infoEditors}</>
                                                                    :
                                                                    <><p>To add metadata info click and drag items from Info</p></>
                                                                }
                                                            </Droppable>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='row mt-2'>
                                            <div className="col pt-2">
                                                <div className='card'>
                                                    <div className='card-header bg-primary'>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h6 id="types" className='pt-1 text-light'>Types* <small style={{ fontSize: '10px' }}> schema content </small></h6>
                                                            </div>
                                                            <div className='col'>
                                                                {generatedSchema.types &&
                                                                    <>
                                                                        <div className="btn-group btn-group-sm float-end" role="group" aria-label="Basic example">
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setTypesCollapse(!typesCollapse)}>
                                                                                {typesCollapse ? 'Show Types' : ' Hide Types'}
                                                                                <FontAwesomeIcon icon={typesCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-end btn btn-sm text-light'
                                                                                    title={typesCollapse ? 'Show Types' : 'Hide Types'} />
                                                                            </button>
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setAllFieldsCollapse(!allFieldsCollapse)}>
                                                                                {allFieldsCollapse ? 'Show Fields' : 'Hide Fields'}
                                                                                <FontAwesomeIcon icon={allFieldsCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-end btn btn-sm text-light'
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
                                                            <Droppable onDrop={onSchemaDrop} acceptableType={"TypesKeys"} >
                                                                {generatedSchema.types ?
                                                                    <>{typesEditors}</> :
                                                                    <><p>To add schema content click and drag items from Types</p></>
                                                                }
                                                            </Droppable>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>

                    <div className={`tab-pane fade ${activeView == 'schema' ? 'show active' : ''}`} id="schema" role="tabpanel" aria-labelledby="schema-tab" tabIndex={0}>
                        <div className='card'>
                            <div className='card-body p-0'>
                                <SBEditor data={generatedSchema} isReadOnly={true}></SBEditor>
                            </div>
                        </div>
                    </div>
                    <SBScrollToTop divID='schema-editor' />
                </div >
            </div>
        </div>
    )
});
export default SchemaCreator 