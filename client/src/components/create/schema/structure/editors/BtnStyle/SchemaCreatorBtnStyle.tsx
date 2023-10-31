import React, { useEffect, memo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { flushSync } from 'react-dom';
import { faCheck, faCircleChevronDown, faCircleChevronUp, faPlusSquare, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Info, Types } from '../../structure';
import { loadFile, setSchema } from 'actions/util';
import { validateSchema } from 'actions/validate';
import { getAllSchemas } from 'reducers/util';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import { StandardTypeObject, TypeKeys } from '../consts';
import { getFilenameOnly, zip } from 'components/utils/general';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import SBSelect, { Option } from 'components/common/SBSelect';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBEditor from 'components/common/SBEditor';
import SBDownloadFile from 'components/common/SBDownloadFile';
import SBFileUploader from 'components/common/SBFileUploader';
import SBSaveFile from 'components/common/SBSaveFile';
import SBSpinner from 'components/common/SBSpinner';
import SBScrollToTop from 'components/common/SBScrollToTop';
import SBOutlineBtnStyle from './SBOutlineBtnStyle';
import { AddToIndexDropDown } from './AddToIndexDropDown';
import { DragItem } from '../DragStyle/SBOutline';
import { TypeArray, StandardTypeArray } from 'components/create/schema/interface';



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
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState } = props;

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
    const [allFieldsCollapse, setAllFieldsCollapse] = useState(false);
    const [infoCollapse, setInfoCollapse] = useState(false);
    const [typesCollapse, setTypesCollapse] = useState(false);
    const schemaOpts = useSelector(getAllSchemas);
    const ref = useRef<HTMLInputElement | null>(null);

    const [insertAt, setInsertAt] = useState(defaultInsertIdx);
    let indexOpts = generatedSchema.types ?
        (generatedSchema.types.length == 1) ?
            [{ value: "0", label: `${generatedSchema.types[0][0]} (beginning)` }, { value: "end", label: "end" }] :
            generatedSchema.types.map((item: any, i: number) => {
                if (i == 0) {
                    return { value: "0", label: `${item[0]} (beginning)` };
                } else if (i == (generatedSchema.types.length - 1)) {
                    return { value: "end", label: `${item[0]} (end)` }
                } else {
                    return { value: `${i}`, label: `${item[0]} (index: ${i})` };
                }
            }) :
        [defaultInsertIdx];

    useEffect(() => {
        indexOpts = generatedSchema.types ?
            (generatedSchema.types.length == 1) ?
                [{ value: "0", label: `${generatedSchema.types[0][0]} (beginning)` }, { value: "end", label: "end" }] :
                generatedSchema.types.map((item: any, i: number) => {
                    if (i == 0) {
                        return { value: "0", label: `${item[0]} (beginning)` };
                    } else if (i == (generatedSchema.types.length - 1)) {
                        return { value: "end", label: `${item[0]} (end)` }
                    } else {
                        return { value: `${i}`, label: `${item[0]} (index: ${i})` };
                    }
                }) :
            [defaultInsertIdx];
        const optionValue = generatedSchema.types ? insertAt.value : defaultInsertIdx.value;
        const selectedOption = indexOpts.filter((option: Option) => option.value == optionValue);
        setInsertAt(selectedOption[0]);
    }, [generatedSchema])


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
                    setCardsState(schemaObj.types.map((item, i) => ({
                        id: self.crypto.randomUUID(),
                        index: i,
                        text: item[0],
                        value: item,
                        isStarred: false
                    })));
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
        setCardsState([]);
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
                        setGeneratedSchema(dataObj);
                        setCardsState(dataObj.types.map((item, i) => ({
                            id: self.crypto.randomUUID(),
                            index: i,
                            text: item[0],
                            value: item,
                            isStarred: false
                        })));
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
            <div className='list-group-item  d-flex justify-content-between align-items-center p-2' key={k}>
                {Info[k].key}

                <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-info'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </button>
            </div>
        ));
    } else {
        infoKeys = Object.keys(Info).map(k => (
            <div className='list-group-item d-flex justify-content-between align-items-center p-2' key={k}>
                {Info[k].key}

                <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-info'
                    disabled={selectedFile?.value == 'file' ? true : false}
                    title='Add to Schema'>
                    <FontAwesomeIcon icon={faPlusSquare} />
                </button>
            </div>
        ));
    }

    const typesKeys = Object.keys(Types).map(k => (
        <div className='list-group-item d-flex justify-content-between align-items-center p-2' key={k}>
            {Types[k].key}

            <button type='button' onClick={() => onDrop(k)} className='btn btn-sm btn-outline-info'
                disabled={selectedFile?.value == 'file' ? true : false}
                title='Add to Schema'>
                <FontAwesomeIcon icon={faPlusSquare} />
            </button>
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

            var scrollSpyContentEl = document.getElementById(`${key}`)
            scrollSpyContentEl?.scrollIntoView();

        } else if (Object.keys(Types).includes(key)) {
            let tmpTypes = generatedSchema.types ? [...generatedSchema.types] : [];
            let tmpCards = [...cardsState];
            const type_name = get_type_name(tmpTypes, `${Types[key].key}-Name`);
            const tmpDef = Types[key].edit({ name: type_name });
            const dataIndex = generatedSchema.types?.length || 0;
            const new_card = {
                id: self.crypto.randomUUID(),
                index: dataIndex,
                text: type_name,
                value: tmpDef,
                isStarred: false
            }

            if (insertAt.value == "0") {
                new_card.index = 0;
                tmpTypes.unshift(tmpDef);
                tmpCards.unshift(new_card);

            } else if (insertAt.value == "end") {
                tmpTypes.push(tmpDef);
                tmpCards.push(new_card);

            } else {
                const idx = parseInt(insertAt.value);
                new_card.index = idx;

                tmpTypes = [
                    ...tmpTypes.slice(0, idx),
                    tmpDef,
                    ...tmpTypes.slice(idx)
                ];
                tmpCards = [
                    ...tmpCards.slice(0, idx),
                    new_card,
                    ...tmpCards.slice(idx)
                ];
            }

            let updatedSchema = {
                ...generatedSchema,
                types: tmpTypes
            };

            flushSync(() => {
                setGeneratedSchema(updatedSchema);
                setCardsState(tmpCards);
            });
            setIsValidJADN(false);
            setIsValidating(false);

            var scrollSpyContentEl = document.getElementById(`${new_card.index}`)
            scrollSpyContentEl?.scrollIntoView();

        } else {
            console.log('Error: OnDrop() in client/src/components/generate/schema/SchemaCreator.tsx');
        }
    }

    const onStarClick = (idx: number) => {
        const updatedCards = cardsState.map((item: DragItem, i: number) => {
            if (i === idx) {
                return ({ ...item, isStarred: !item.isStarred });
            } else {
                return item;
            }
        });

        setCardsState(updatedCards);
    };



    const changeIndex = (arrVal: TypeArray, dataIndex: number, idx: number) => {
        const val = zip(TypeKeys, arrVal) as StandardTypeObject;
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

        let tmpCards = [...cardsState];
        const moved_card = tmpCards[dataIndex];
        tmpCards = tmpCards.filter((_t, i) => i !== dataIndex);

        tmpCards = [
            ...tmpCards.slice(0, idx),
            moved_card,
            ...tmpCards.slice(idx)
        ];

        setGeneratedSchema(updatedSchema);
        setCardsState(tmpCards);

        setIsValidJADN(false);
        setIsValidating(false);

        var scrollSpyContentEl = document.getElementById(`${dataIndex}`)
        scrollSpyContentEl?.scrollIntoView();
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

    const typesEditors = (generatedSchema.types || []).map((def: StandardTypeArray, i: number) => {
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

                const valArray: TypeArray = Object.values(val);
                const updatedCards = cardsState.map((card: DragItem, i: number) => {
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
                setGeneratedSchema((prev: any) => ({ ...prev, types: tmpTypes }));
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
                                setDropdown={onFileSelect} />
                        </div>
                        <div className='d-none'>
                            <SBFileUploader ref={ref} id={"schema-file"} accept={".jadn"} onCancel={onCancelFileUpload} onChange={onFileChange} />
                        </div>
                    </div>
                    <div className='col-sm-9'>
                        <SBCopyToClipboard buttonId='copyMessage' data={generatedSchema} customClass={'float-end'} />
                        <SBDownloadFile buttonId='schemaDownload' filename={fileName} data={generatedSchema} customClass={'float-end me-1'} />
                        <button type='button' onClick={() => setActiveView('schema')} className={`float-end btn btn-sm btn-primary me-1 ${activeView == 'schema' ? ' d-none' : ''}`} title="View in JSON">View JSON</button>
                        <button type='button' onClick={() => setActiveView('creator')} className={`float-end btn btn-sm btn-primary me-1 ${activeView == 'creator' ? ' d-none' : ''}`} title="View via Input Form">View Form</button>
                        {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                            <button id='validateJADNButton' type='button' className="float-end btn btn-sm btn-primary me-1" title={isValidJADN ? "JADN is valid" : "Validate JADN"} onClick={onValidateJADNClick}>
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
                    <div className={`tab-pane fade ${activeView == 'creator' ? 'show active' : ''}`} id="creator" role="tabpanel" aria-labelledby="creator-tab" tabIndex={0}>
                        <div className='row'>
                            <div id="schema-options" className='col-sm-3 pr-1 card-body-scroller'>
                                <div className='row'>
                                    <div className='col'>
                                        <ul className="nav nav-pills pb-2" id="editorKeys" role="tablist">
                                            <li className='nav-item me-2'>
                                                <a
                                                    className={`nav-link 
                                                    ${activeOpt == 'info' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
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
                                                    ${activeOpt == 'types' && (selectedFile?.value == 'file' && !generatedSchema ? false : true) ? ' active' : ''}
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
                                <div className='row mt-2'>
                                    <AddToIndexDropDown insertAt={insertAt} indexOpts={indexOpts} onSelectChange={onSelectChange} />
                                </div>
                                <div className='row mt-2'>
                                    <div className='col'>
                                        <SBOutlineBtnStyle id={'schema-outline'}
                                            items={cardsState}
                                            title={'Outline'}
                                            changeIndex={changeIndex}
                                            onStarClick={onStarClick}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div id="schema-editor" className='col-md-9 px-2 card-body-scroller'>
                                {isLoading ? <SBSpinner action={'Loading'} isDiv /> :
                                    <>
                                        <div className='row'>
                                            <div className="col pt-2">
                                                <div className='card border border-secondary'>
                                                    <div className='card-header bg-primary'>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h6 id="info" className='mb-0'>Info <small style={{ fontSize: '10px' }}> metadata </small></h6>
                                                            </div>
                                                            <div className='col'>
                                                                <legend>
                                                                    <FontAwesomeIcon icon={infoCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                        className='float-end btn btn-sm text-light'
                                                                        onClick={() => setInfoCollapse(!infoCollapse)}
                                                                        title={infoCollapse ? ' Show Info' : ' Hide Info'} />
                                                                </legend>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='card-body'>
                                                        {!infoCollapse &&
                                                            <div>
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
                                                <div className='card border border-secondary'>
                                                    <div className='card-header bg-primary'>
                                                        <div className='row'>
                                                            <div className='col'>
                                                                <h6 id="types" className='mb-0 pt-1'>Types* <small style={{ fontSize: '10px' }}> schema content </small></h6>
                                                            </div>
                                                            <div className='col'>
                                                                {generatedSchema.types &&
                                                                    <>
                                                                        <div className="btn-group btn-group-sm float-end" role="group" aria-label="Basic example">
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setTypesCollapse(!typesCollapse)}>
                                                                                {typesCollapse ? 'Show Types' : ' Hide Types'}
                                                                                <FontAwesomeIcon icon={typesCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-end btn btn-sm'
                                                                                    title={typesCollapse ? 'Show Types' : 'Hide Types'} />
                                                                            </button>
                                                                            <button type="button" className="btn btn-secondary" onClick={() => setAllFieldsCollapse(!allFieldsCollapse)}>
                                                                                {allFieldsCollapse ? 'Show Fields' : 'Hide Fields'}
                                                                                <FontAwesomeIcon icon={allFieldsCollapse ? faCircleChevronDown : faCircleChevronUp}
                                                                                    className='float-end btn btn-sm'
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
export default SchemaCreatorBtnStyle 