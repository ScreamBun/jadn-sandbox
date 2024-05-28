import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { getPageTitle } from 'reducers/util'
import { info, setSchema } from 'actions/util'
import { convertJsonSchema, convertSchema } from 'actions/convert'
import { LANG_JSON, LANG_JSON_UPPER } from 'components/utils/constants'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess, sbToastWarning } from 'components/common/SBToast'
import { SchemaJADN } from 'components/create/schema/interface'
import ExampleCreator from './ExampleCreator'


export interface Option {
    readonly value: string | any;
    readonly label: string;
}

const ExampleGenerator = () => {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState<Option | null>(null);
    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [loadedSchema, setLoadedSchema] = useState<object | null>(null);
    const [generatedMessages, setGeneratedMessages] = useState<any[]>([]);
    const [numOfMsg, setNumOfMsg] = useState<number>(1);

    const defaultLangOption = new Option(LANG_JSON_UPPER)
    const [langSel, setLangSel] = useState<Option | null>(defaultLangOption);

    const [isLoading, setIsLoading] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Data Generation'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "generation_form";

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setGeneratedMessages([]);
    }, [loadedSchema])

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema(null);
        setNumOfMsg(1);
        setLangSel(defaultLangOption);
        setGeneratedMessages([]);
        dispatch(setSchema(null));
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        let schemaObj: SchemaJADN | string = loadedSchema;
        // let schemaProps: any[] = [];

        if (typeof schemaObj == 'string') {
            try {
                schemaObj = JSON.parse(loadedSchema);
            } catch (err) {
                if (err instanceof Error) {
                    setIsLoading(false);
                    sbToastError(err.message);
                }
            }
        }

        if (!numOfMsg || numOfMsg < 0) {
            setIsLoading(false);
            sbToastError("Error: Must select a number more than zero");
            return;
        }

        if (numOfMsg && numOfMsg > 10) {
            setIsLoading(false);
            sbToastError("Error: Must select a number less than ten");
            return;
        }

        //TODO? : allow user to provide reference data to resolve schema 
        if (schemaObj.info && Object.keys(schemaObj.info).includes('namespaces')) {
            setIsLoading(false);
            sbToastError("Error: Schema must be resolved");
            return;
        }
        if (schemaObj.info && !Object.keys(schemaObj.info).includes('exports')) {
            setIsLoading(false);
            sbToastWarning("Warning: Schema requires Exports to generate Type");
            return;
        }

        // Convert to JSONSchema
        dispatch(convertSchema(schemaObj, schemaFormat?.value, [LANG_JSON]))
            .then((convertSchemaVal) => {
                if (convertSchemaVal.error) {
                    console.error(convertSchemaVal.payload.response);
                    setIsLoading(false);
                    sbToastError('Failed to generate examples: Invalid JSON data');
                    return;
                }

                // Get JSONSchema
                const schema = JSON.parse(convertSchemaVal.payload.schema.convert[0].schema);

                // Generate Fake Data for Examples
                dispatch(convertJsonSchema(schema, langSel.value, numOfMsg))
                    .then((response) => {
                        let gen_data = response.payload.data;

                        if (gen_data.length != 0) {
                            setIsLoading(false);
                            sbToastSuccess('Examples generated successfully');
                            setGeneratedMessages(gen_data)
                        } else {
                            setIsLoading(false);
                            sbToastError('Failed to generate examples');
                        }

                    }).catch((err) => {
                        setIsLoading(false);
                        sbToastError('Error generating examples');
                        console.error(err);
                    });  

            }).catch((convertSchemaErr) => {
                setIsLoading(false);
                sbToastError('Failed to generate examples: JADN TO JSON conversion failed');
                console.error(convertSchemaErr);
            });
    }

    return (
        <div>
            <Helmet>
                <title>{meta_title}</title>
                <link rel="canonical" href={meta_canonical} />
            </Helmet>
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Data Generation</span></h5>
                            <button type='reset' className='btn btn-sm btn-danger float-end' onClick={onReset}>Reset</button>
                        </div>
                        <div className='card-body p-2'>
                            <form id={formId} onSubmit={submitForm}>
                                <div className='row'>
                                    <div className='col-md-6 pr-1'>
                                        <SchemaLoader
                                            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
                                            schemaFormat={schemaFormat} setSchemaFormat={setSchemaFormat}
                                            loadedSchema={loadedSchema} setLoadedSchema={setLoadedSchema} />
                                    </div>
                                    <div className='col-md-6 pl-1'>
                                        <ExampleCreator
                                            formId={formId} isLoading={isLoading}
                                            generatedMessages={generatedMessages} setGeneratedMessages={setGeneratedMessages} 
                                            numOfMsg={numOfMsg} setNumOfMsg={setNumOfMsg} 
                                            langSel={langSel} setLangSel={setLangSel} 
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ExampleGenerator 