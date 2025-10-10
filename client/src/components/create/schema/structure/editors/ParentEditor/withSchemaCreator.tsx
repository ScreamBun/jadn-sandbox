import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { flushSync } from 'react-dom';
import { setSchema } from 'actions/util';
import { getAllSchemas, getSelectedSchema } from 'reducers/util';
import { LANG_JADN } from 'components/utils/constants';
import { $MAX_BINARY, $MAX_STRING, $MAX_ELEMENTS, $SYS, $TYPENAME, $FIELDNAME, $NSID } from '../../../../consts';
import { Types } from '../../structure';
import SBCopyToClipboard from 'components/common/SBCopyToClipboard';
import SBSpinner from 'components/common/SBSpinner';
import SBValidateSchemaBtn from 'components/common/SBValidateSchemaBtn';
import SBDownloadBtn from 'components/common/SBDownloadBtn';
import { Option } from 'components/common/SBSelect';
import SchemaLoader from 'components/common/SchemaLoader';


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
    const { selectedFile, setSelectedFile, generatedSchema, setGeneratedSchema, cardsState, setCardsState,
            fieldCollapseState, setFieldCollapseState,
            allFieldsCollapse, setAllFieldsCollapse, fieldCollapseStateRef } = props;
    
    const loadedSchema = useSelector(getSelectedSchema);
    const setLoadedSchema = (schema: object | null) => {
        dispatch(setSchema(schema));
    };
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);

    useEffect(() => {
        setGeneratedSchema(loadedSchema);
    },  [loadedSchema])

        useEffect(() => {
            if (!generatedSchema) {
                setIsValidJADN(false);
                setFieldCollapseState([]);
                dispatch(setSchema(generatedSchema));
                return;
            }
            dispatch(setSchema(generatedSchema));

            // If a schema is piped and we don't yet have cards, build them here
            try {
                const schemaObj: any = typeof generatedSchema === 'string' ? JSON.parse(generatedSchema) : generatedSchema;
                if (schemaObj && Array.isArray(schemaObj.types)) {
                    setGeneratedSchema(schemaObj);
                    setCardsState(schemaObj.types.map((item: any[], i: number) => ({
                        id: self.crypto?.randomUUID ? self.crypto.randomUUID() : Math.random().toString(36).slice(2),
                        index: i,
                        text: item[0],
                        value: item,
                        isStarred: false,
                        isVisibleInOutline: true
                    })));
                    setFieldCollapseState(schemaObj.types.map((def: any[]) => {
                        let type = def[1]?.toLowerCase() as keyof typeof Types;
                        if (type && Types[type]?.type === 'structure') {
                            return false;
                        } else {
                            return undefined as unknown as boolean;
                        }
                    }))
                }
            } catch (e) {
                // Ignore JSON parse errors
            }

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
        const [activeOpt, setActiveOpt] = useState('meta');

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

        return (
            <div className='card'>
                <div className='card-header p-2'>
                    <div className='row no-gutters'>
                        <div className='col-sm-3 align-self-center'>
                            <SchemaLoader
                                selectedFile={selectedFile}
                                setSelectedFile={setSelectedFile}
                                loadedSchema={loadedSchema}
                                setLoadedSchema={setLoadedSchema}
                                schemaFormat={schemaFormat}
                                setSchemaFormat={setSchemaFormat}
                                showEditor={false}
                                showCopy={false}
                                showFormatter={false}
                                showSave={true}
                                lightBackground={true}
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