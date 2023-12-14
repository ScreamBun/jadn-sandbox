import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { flushSync } from 'react-dom';
import { setSchema } from 'actions/util';
import { validateSchema } from 'actions/validate';
import { getAllSchemas } from 'reducers/util';
import { validateJSON } from 'components/utils/general';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import { dismissAllToast, sbToastError, sbToastSuccess } from 'components/common/SBToast';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBDownloadFile from 'components/common/SBDownloadFile';
import SBSpinner from 'components/common/SBSpinner';
import SBSchemaLoader from 'components/common/SBSchemaLoader';
import SBValidateSchemaBtn from 'components/common/SBValidateSchemaBtn';


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
        const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState } = props;

        useEffect(() => {
            if (!generatedSchema) {
                setIsValidJADN(false);
            }
            dispatch(setSchema(generatedSchema));
        }, [generatedSchema])

        const [configOpt, setConfigOpt] = useState(configInitialState);
        const [fileName, setFileName] = useState({
            name: '',
            ext: 'jadn'
        });
        const [isValidJADN, setIsValidJADN] = useState(false);
        const [isValidating, setIsValidating] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const [activeView, setActiveView] = useState('creator');
        const [activeOpt, setActiveOpt] = useState('info');

        const schemaOpts = useSelector(getAllSchemas);
        const ref = useRef<HTMLInputElement | null>(null);

        const listRef = useRef<any>(null);
        const rowHeight = useRef({});
        const setRowHeight = useCallback((index: number, size: number) => {
            rowHeight.current = { ...rowHeight.current, [index]: size };
            listRef.current?.resetAfterIndex(0, false);
        }, []);

        const getItemSize = (index: number) => {
            return rowHeight.current[index] || 0
        };

        const onFileChange = (schemaStr: any) => {
            setIsLoading(false);
            if (schemaStr) {
                const dataObj = JSON.parse(schemaStr);
                const validJADN = validateJADN(schemaStr);
                if (validJADN) {
                    flushSync(() => {
                        setGeneratedSchema(dataObj);
                        setCardsState(dataObj.types.map((item: any[], i: any) => ({
                            id: self.crypto.randomUUID(),
                            index: i,
                            text: item[0],
                            value: item,
                            isStarred: false
                        })));
                    });
                }
            } else {
                setGeneratedSchema('');
                setCardsState([]);
            }
            setIsValidating(false);
        }

        const onCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            dismissAllToast();
            setIsValidJADN(false);
            setIsValidating(false);
            setIsLoading(false);
            setSelectedFile(null);
            setGeneratedSchema('');
            setCardsState([]);
        }

        const validateJADN = (jsonToValidate: any) => {
            dismissAllToast();
            setIsValidJADN(false);
            setIsValidating(true);

            let jsonObj = validateJSON(jsonToValidate);
            if (jsonObj == false) {
                sbToastError(`Invalid JSON. Cannot validate JADN`);
                setIsValidating(false);
                return false;
            }

            return dispatch(validateSchema(jsonObj))
                .then((validateSchemaVal: any) => {
                    if (validateSchemaVal.payload.valid_bool == true) {
                        dispatch(setSchema(jsonObj));
                        setIsValidJADN(true);
                        sbToastSuccess(validateSchemaVal.payload.valid_msg);
                        return true;
                    } else {
                        sbToastError(validateSchemaVal.payload.valid_msg);
                        return false;
                    }
                })
                .catch((validateSchemaErr) => {
                    sbToastError(validateSchemaErr.payload.valid_msg)
                    return false;
                })
        }


        return (
            <div className='card'>
                <div className='card-header p-2'>
                    <div className='row no-gutters'>
                        <div className='col-sm-3'>
                            <SBSchemaLoader
                                schemaOpts={schemaOpts}
                                selectedSchemaOpt={selectedFile}
                                loadedSchema={generatedSchema}
                                fileName={fileName}
                                setFileName={setFileName}
                                schemaFormat={'jadn'}
                                setSelectedFile={setSelectedFile}
                                onCancelFileUpload={onCancelFileUpload}
                                onFileChange={onFileChange}
                                ref={ref}
                            />
                        </div>
                        <div className='col-sm-9'>
                            <SBCopyToClipboard buttonId='copyMessage' data={generatedSchema} customClass={'float-end'} />
                            <SBDownloadFile buttonId='schemaDownload' filename={fileName.name} data={generatedSchema} customClass={'float-end me-1'} />
                            <button type='button' onClick={() => setActiveView('schema')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'schema' ? ' d-none' : ''}`} title="View in JSON">View JSON</button>
                            <button type='button' onClick={() => setActiveView('creator')} className={`float-end btn btn-primary btn-sm me-1 ${activeView == 'creator' ? ' d-none' : ''}`} title="View via Input Form">View Form</button>
                            {isValidating ? <SBSpinner action={"Validating"} color={"primary"} /> :
                                <SBValidateSchemaBtn
                                    isValid={isValidJADN}
                                    setIsValid={setIsValidJADN}
                                    setIsValidating={setIsValidating}
                                    schemaData={generatedSchema}
                                    schemaFormat={'jadn'}
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
                        cardsState={cardsState}
                        setCardsState={setCardsState}
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