import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getPageTitle, getSelectedFile, getSelectedSchema } from 'reducers/util'
import { convertSchema, info } from 'actions/convert'
import SchemaLoader from 'components/common/SchemaLoader'
import { dismissAllToast, sbToastError, sbToastSuccess, sbToastWarning } from 'components/common/SBToast'
import { SchemaJADN } from 'components/create/schema/interface'
import SchemaVisualized from './SchemaVisualized'
import { Option } from 'components/common/SBSelect'
import { setFile, setSchema, setSchemaValid } from 'actions/util'
import { LANG_PLANTUML_2, PLANTUML_RENDER_LIMIT } from 'components/utils/constants'
import { VisualOptionsModal } from './VisualOptionsModal'

export const initConvertedSchemaState = [{
    schema: '',
    fmt: '',
    fmt_ext: ''
}]

const SchemaVisualizer = () => {
    const dispatch = useDispatch();

    const loadedSchema = useSelector(getSelectedSchema);
    const setLoadedSchema = (schema: object | null) => {
        dispatch(setSchema(schema));
    }

    const selectedFile = useSelector(getSelectedFile);
    const setSelectedFile = (file: Option | null) => {
        dispatch(setFile(file));
    }

    const [schemaFormat, setSchemaFormat] = useState<Option | null>(null);
    const [conversion, setConversion] = useState<Option[]>([]);
    const [convertedSchema, setConvertedSchema] = useState(initConvertedSchemaState);
    const [isLoading, setIsLoading] = useState(false);
    const [spiltViewFlag, setSplitViewFlag] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const meta_title = useSelector(getPageTitle) + ' | Schema Visualization'
    const meta_canonical = `${window.location.origin}${window.location.pathname}`;
    const formId = "visualization_form";

    useEffect(() => {
        dispatch(info());
        dismissAllToast();
    }, [dispatch])

    useEffect(() => {
        setConvertedSchema(initConvertedSchemaState);
        setSplitViewFlag(false);
    }, [loadedSchema]);

    const onReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        dismissAllToast();
        setIsLoading(false);
        setSelectedFile(null);
        setLoadedSchema(null);
        setConversion([]);
        setConvertedSchema(initConvertedSchemaState);
        setSplitViewFlag(false);
        dispatch(setSchema(null));
        dispatch(setSchemaValid(false))
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (conversion) {

            const arr = conversion.map(obj => obj.value);
            if (arr.indexOf("gv") > -1 || arr.indexOf("puml") > -1) {
                setIsModalOpen(true);
            } else {
                submitConversions();
            }            

        } else {
            setIsLoading(false);
            sbToastError("A visualization selection is required");
        }
    }

    const submitConversions = (opts?: string[]) => {

        let schemaObj: SchemaJADN | string = loadedSchema;

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

        const arr = conversion.map(obj => obj.value);
        dispatch(convertSchema(schemaObj, schemaFormat?.value, arr, opts))
            .then((convertSchemaVal) => {
                if (convertSchemaVal.error) {
                    setIsLoading(false);
                    setConvertedSchema(initConvertedSchemaState);
                    sbToastError(convertSchemaVal.payload.response);
                    return;
                }
                setIsLoading(false);
                setConvertedSchema(convertSchemaVal.payload.schema.convert);
                const convertedArr = convertSchemaVal.payload.schema.convert.map(obj => obj.fmt_ext);
                for (let i = 0; i < convertSchemaVal.payload.schema.convert.length; i++) {
                    if (convertedArr.includes(arr[i])) {
                        if (convertSchemaVal.payload.schema.convert[i].err == false) {

                            sbToastSuccess(`Schema visualized to ${convertSchemaVal.payload.schema.convert[i].fmt} successfully`);
                            
                            if(convertSchemaVal.payload.schema.convert[i].fmt && convertSchemaVal.payload.schema.convert[i].fmt === LANG_PLANTUML_2){
                                if(convertSchemaVal.payload.schema.convert[i].schema && convertSchemaVal.payload.schema.convert[i].schema.length > PLANTUML_RENDER_LIMIT){
                                    sbToastWarning("The generated PlantUML file is larger than "+PLANTUML_RENDER_LIMIT+" characters and may not render visually in the browser.")
                                }
                            }

                        } else {
                            sbToastError(`Schema failed to visualize ${convertSchemaVal.payload.schema.convert[i].fmt} ${convertSchemaVal.payload.schema.convert[i].schema ? `: ${convertSchemaVal.payload.schema.convert[i].schema}` : ''}`);
                        }
                    } else {
                        sbToastError(`Failed to visualize to ${conversion[i].label}`);
                    }
                }
            })
            .catch((convertSchemaErr: string) => {
                setIsLoading(false);
                sbToastError(convertSchemaErr);
            })

    }

    const onModalResponse = (response: boolean, opts: string[]) => {
        setIsModalOpen(false);
        if (response === true){
            submitConversions(opts) 
        } else {
            setIsLoading(false);
        }
      }    

    return (
        <div>
            <title>{meta_title}</title>
            <link rel="canonical" href={meta_canonical} />
            <div className='row'>
                <div className='col-md-12'>
                    <div className='card'>
                        <div className='card-header bg-secondary p-2'>
                            <h5 className='m-0' style={{ display: 'inline' }}><span className='align-middle'>Schema Visualization</span></h5>
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
                                        <SchemaVisualized
                                            convertedSchema={convertedSchema} setConvertedSchema={setConvertedSchema}
                                            conversion={conversion} setConversion={setConversion}
                                            spiltViewFlag={spiltViewFlag} setSplitViewFlag={setSplitViewFlag}
                                            isLoading={isLoading} formId={formId} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <VisualOptionsModal
                isOpen={isModalOpen}
                conversions={conversion}
                onResponse={onModalResponse} >
            </VisualOptionsModal>
        </div>
    );
}

export default SchemaVisualizer