import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { flushSync } from 'react-dom';
import { setSchema } from 'actions/util';
import { validateSchema } from 'actions/validate';
import { getAllSchemas } from 'reducers/util';
import { getFilenameExt, getFilenameOnly } from 'components/utils/general';
import { LANG_JADN } from 'components/utils/constants';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import { Types } from '../../structure';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBSpinner from 'components/common/SBSpinner';
import SBValidateSchemaBtn from 'components/common/SBValidateSchemaBtn';
import SBDownloadBtn from 'components/common/SBDownloadBtn';
import SBFileLoader from 'components/common/SBFileLoader';
import { Option } from 'components/common/SBSelect';


export const configInitialState = {
    $MaxBinary: $MAX_BINARY,
    $MaxString: $MAX_STRING,
    $MaxElements: $MAX_ELEMENTS,
    $Sys: $SYS,
    $TypeName: $TYPENAME,
    $FieldName: $FIELDNAME,
    $NSID: $NSID
}

export default function withSchemaCreator(SchemaWrapper: React.ComponentType<any>) {
    function WithSchemaCreator(props: any) {
        const dispatch = useDispatch();
        const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema, setCardsState,
            fieldCollapseState, setFieldCollapseState,
            allFieldsCollapse, setAllFieldsCollapse, fieldCollapseStateRef } = props;

        useEffect(() => {
            if (!generatedSchema) {
                setIsValidJADN(false);
                setFieldCollapseState([]);
            }
            dispatch(setSchema(generatedSchema));
            listRef.current?.resetAfterIndex(0, true);
        }, [generatedSchema])

        const [configOpt, setConfigOpt] = useState(configInitialState);
        const [fileName, setFileName] = useState({
            name: '',
            ext: LANG_JADN
        });
        const schemaOpts = useSelector(getAllSchemas);
        const ref = useRef<HTMLInputElement | null>(null);

        const [isValidJADN, setIsValidJADN] = useState(false);
        const [isValidating, setIsValidating] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const [activeView, setActiveView] = useState('creator');
        const [activeOpt, setActiveOpt] = useState('info');

        const listRef = useRef<any>(null);
        const rowHeight = useRef({});
        const setRowHeight = useCallback((index: number, size: number) => {
            rowHeight.current = { ...rowHeight.current, [index]: size };
            listRef.current?.resetAfterIndex(0, false);
        }, []);

        const getItemSize = (index: number) => {
            return rowHeight.current[index] || 0
        };

        useEffect(() => {
            fieldCollapseStateRef.current = fieldCollapseState;
        }, [fieldCollapseState]);

        useEffect(() => {
            //if all Fields Collapsed, set collapseAllFields = true
            fieldCollapseStateRef.current = fieldCollapseState;
            listRef.current?.resetAfterIndex(0, true);

            if (fieldCollapseState.length > 0) {
                let count = 0;
                let tracker = 0;
                for (let i in fieldCollapseState) {
                    if (fieldCollapseState[i] == true || fieldCollapseState[i] == false) {
                        count++;
                        if (fieldCollapseState[i] == true) {
                            tracker++;
                        }
                    }
                }

                if (tracker == 0 && allFieldsCollapse != false) {
                    setAllFieldsCollapse(false)
                } else if (tracker != 0 && tracker == count && allFieldsCollapse != true) {
                    setAllFieldsCollapse(true);
                }
            }
        }, [fieldCollapseState])

        const onCollapseAllFields = (e: React.MouseEvent<HTMLElement>) => {
            e.preventDefault();
            if (!allFieldsCollapse == true && fieldCollapseState.length > 0) {
                const updatedFieldCollapseState = fieldCollapseState.map((bool) => {
                    if (bool === false) {
                        return true;
                    } else {
                        return bool;
                    }
                });
                setFieldCollapseState(updatedFieldCollapseState);

            } else if (!allFieldsCollapse == false && fieldCollapseState.length > 0) {
                const updatedFieldCollapseState = fieldCollapseState.map((bool) => {
                    if (bool === true) {
                        return false;
                    } else {
                        return bool;
                    }
                });
                setFieldCollapseState(updatedFieldCollapseState);
            }
            setAllFieldsCollapse(!allFieldsCollapse)
        }

        const onFileLoad = async (schemaObj?: any, fileStr?: Option) => {
            if (schemaObj && fileStr) {
                if (typeof schemaObj == "string") {
                    try {
                        schemaObj = JSON.parse(schemaObj);
                    } catch (err) {
                        sbToastError(`Schema cannot be loaded: Invalid JSON`);
                        return;
                    }
                }
                const validJADNSyntax = await validateJADNSyntax(schemaObj);
                if (validJADNSyntax == true) {
                    setIsLoading(true);
                    setSelectedFile(fileStr);
                    const fileName = {
                        name: getFilenameOnly(fileStr.label),
                        ext: getFilenameExt(fileStr.label)
                    }
                    setFileName(fileName);

                    flushSync(() => {
                        setGeneratedSchema(schemaObj);
                        if (schemaObj.types) {
                            setCardsState(schemaObj.types.map((item: any[], i: number) => ({
                                id: self.crypto.randomUUID(),
                                index: i,
                                text: item[0],
                                value: item,
                                isStarred: false,
                                isVisibleInOutline: true
                            })));
                            setFieldCollapseState(schemaObj.types.map((def: any[]) => {
                                let type = def[1].toLowerCase() as keyof typeof Types;
                                if (Types[type].type == 'structure') {
                                    return false;
                                } else {
                                    return undefined;
                                }
                            }))
                        } else {
                            setCardsState([]);
                            setFieldCollapseState([]);
                        }
                    });
                } else {
                    sbToastError(`Schema cannot be loaded: Invalid JADN`);
                }
            } else {
                sbToastError(`Schema cannot be loaded: Empty File`);
            }
            setIsLoading(false);
        }

        const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => {
            if (e) {
                e.preventDefault();
            }
            dismissAllToast();
            setIsValidJADN(false);
            setIsValidating(false);
            setIsLoading(false);
            setFileName({
                name: '',
                ext: LANG_JADN
            });
            setSelectedFile(null);
            setGeneratedSchema('');
            setCardsState([]);
            setFieldCollapseState([]);
            if (ref.current) {
                ref.current.value = '';
            }
        }

        const validateJADNSyntax = (jsonObj: any) => {
            dismissAllToast();
            setIsValidJADN(false);
            if (!jsonObj) {
                sbToastError('Validation Error: No Schema to validate');
                return false;
            }

            setIsValidating(true);

            return dispatch(validateSchema(jsonObj, LANG_JADN))
                .then((validateSchemaVal: any) => {
                    setIsValidating(false);
                    if (validateSchemaVal.payload.valid_bool == true) {
                        dispatch(setSchema(jsonObj));
                        setIsValidJADN(true);
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        return true;
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                        return validateSchemaVal.payload.valid_syntax;
                    }
                })
                .catch((validateSchemaErr) => {
                    setIsValidating(false);
                    sbToastError(validateSchemaErr.payload.valid_msg);
                    return validateSchemaErr.payload.valid_syntax;
                })
        }


        return (
            <div className='card'>
                <div className='card-header p-2'>
                    <div className='row no-gutters'>
                        <div className='col-sm-3 align-self-center'>
                            <SBFileLoader
                                opts={schemaOpts}
                                selectedOpt={selectedFile}
                                loadedFileData={generatedSchema}
                                fileName={fileName}
                                setSelectedFile={setSelectedFile}
                                onCancelFileUpload={onCancelFileUpload}
                                onFileChange={onFileLoad}
                                ref={ref}
                                placeholder={'Select a schema...'}
                                loc={'schemas'}
                                isSaveable
                            />
                        </div>
                        <div className='col-sm-9 align-self-center'>
                            <SBCopyToClipboard buttonId='copyMessage' data={generatedSchema} customClass={'float-end'} />
                            <SBDownloadBtn buttonId='schemaDownload' filename={fileName.name} data={generatedSchema} customClass={'float-end me-1'} />
                            <button type='button' onClick={() => setActiveView('schema')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'schema' ? ' d-none' : ''}`} title="View in JSON">View JSON</button>
                            <button type='button' onClick={() => setActiveView('creator')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'creator' ? ' d-none' : ''}`} title="View via Input Form">View Form</button>
                            {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                                <SBValidateSchemaBtn
                                    isValid={isValidJADN}
                                    setIsValid={setIsValidJADN}
                                    setIsValidating={setIsValidating}
                                    schemaData={generatedSchema}
                                    schemaFormat={LANG_JADN}
                                    customClass={'float-end'}
                                />
                            }
                        </div>
                    </div>
                </div>
                <div className='card-body p-2'>
                    <SchemaWrapper
                        {...props}
                        schemaCreator
                        setIsValidating={setIsValidating}
                        setIsValidJADN={setIsValidJADN}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        activeView={activeView}
                        activeOpt={activeOpt}
                        setActiveOpt={setActiveOpt}
                        getItemSize={getItemSize}
                        setRowHeight={setRowHeight}
                        listRef={listRef}
                        configOpt={configOpt}
                        setConfigOpt={setConfigOpt}
                        collapseAllFields={onCollapseAllFields}
                    />
                </div>
            </div>
        );
    };
    const wrappedComponentName = SchemaWrapper.displayName
        || SchemaWrapper.name
        || 'Component';

    WithSchemaCreator.displayName = `withSchemaCreator(${wrappedComponentName})`;
    return WithSchemaCreator;
};