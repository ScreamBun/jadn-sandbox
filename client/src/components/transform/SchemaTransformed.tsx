import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Button, Form } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBSpinner from "components/common/SBSpinner";
import SBSelect, { Option } from "components/common/SBSelect";
import SBSaveFile from "components/common/SBSaveFile";
import { useDispatch, useSelector } from "react-redux";
import { getValidTransformations } from "reducers/transform";
import { transformSchema } from "actions/transform";
import { sbToastError, sbToastSuccess } from "components/common/SBToast";
import { SelectedSchema } from "components/transform/SchemaTransformer";


interface SchemaTransformedProps {
    isLoading: boolean;
    onLoading: (isLoading: boolean) => void;
    onSelectedSchemaReplaceAll: (schemas: SelectedSchema[]) => void;
    selectedSchemas: SelectedSchema[];
}

export const initTransformedSchema = {
    schema: '',
    schema_name: ''
}

const SchemaTransformed = forwardRef((props: SchemaTransformedProps, ref) => {
    const dispatch = useDispatch();

    const transformationOpts = useSelector(getValidTransformations);

    const [toggle, setToggle] = useState('');
    const [isTransformDisabled, setIsTransformDisabled] = useState(true);
    const [baseFile, setBaseFile] = useState<Option | null>();
    const [transformationType, setTransformationType] = useState<Option | null>();
    const [baseFileOpts, setBaseFileOpts] = useState<Option[]>();
    const [transformedSchema, setTransformedSchema] = useState([initTransformedSchema]);

    const strip_comments: string = 'strip comments';
    const resolve_references: string = 'resolve references';

    useEffect(() => {
        console.log("SchemaTransformed useEffect props.selectedSchemas");
        setTransformedSchema([initTransformedSchema]);
        setBaseFile(null);
    }, [props.selectedSchemas]);

    useEffect(() => {
        console.log("SchemaTransformed useEffect props.selectedSchemas, baseFile, transformationType");
        setIsTransformDisabled(true);
        if(props.selectedSchemas && props.selectedSchemas.length > 0 && transformationType && transformationType.value){
            if(transformationType.value == strip_comments){
                setIsTransformDisabled(false);
            }
            if(transformationType.value == resolve_references && baseFile){
                setIsTransformDisabled(false);
            }            
        }

        let base_opts: Option[] = props.selectedSchemas.map((ss: SelectedSchema) => {
            return { 'label' : ss.name, 'value' : ss.name };
        });  
        setBaseFileOpts([...base_opts]);      

    }, [props.selectedSchemas, baseFile, transformationType]);    

    // Allows parent to call child function
    useImperativeHandle(ref, () => ({
        onReset() {
            console.log("SchemaTransformed onReset");
            setToggle('');
            setBaseFile(null);
            setTransformedSchema([initTransformedSchema]);
            setTransformationType(null);          
        },
    }));    

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');
        } else {
            setToggle(`${index}`);
        }
    }

    const onSelectTypeChange = (opt: Option) => {
        setBaseFile(null);
        setTransformedSchema([initTransformedSchema]);
        setTransformationType(opt);
    }

    const onBaseFileSelect = (opt: Option) => {
        setTransformedSchema([initTransformedSchema]);
        setBaseFile(opt);
    }

    const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        props.onLoading(true);
        const selectedBasefile = baseFile?.value ? baseFile.value : '';
        dispatch(transformSchema(props.selectedSchemas, transformationType.value, selectedBasefile))
            .then((val) => {
                if (val.error == true) {
                    let invalid_schema_list: any[] = [];
                    if (typeof val.payload.response == "object") {

                        val.payload.response.forEach((schema) => {
                            sbToastError(`${schema.name} : ${schema.err}`);
                            invalid_schema_list.push(schema.name);
                        });

                        // invalidate selectedFiles 
                        const invalidFiles = props.selectedSchemas.map((ss) => {
                            if (invalid_schema_list.includes(ss.name)) {
                                return { ...ss, 'data': 'err' };
                            } else {
                                return ss;
                            }
                        });
                        props.onSelectedSchemaReplaceAll(invalidFiles);

                    } else {
                        sbToastError(val.payload.response);
                    }

                } else {
                    sbToastSuccess('Transformed Schema successfully');
                    setTransformedSchema(val.payload);
                }
            })
            .catch((err) => {
                sbToastError(err);
            })
            .finally(() => {
                props.onLoading(false);
            });
    }     

    return (
        <div className="card">
            <div className="card-header p-2">
                <Form onSubmit={submitForm}>
                    <div className='row no-gutters'>
                        <div className='col-md-9'>
                            <SBSelect id={"transformation-list"} data={transformationOpts} onChange={onSelectTypeChange}
                                placeholder={'Select transformation type...'} value={transformationType} isSmStyle
                            />
                            {transformationType?.value == 'resolve references' ?
                                <SBSelect id={"base-file"} data={baseFileOpts} onChange={onBaseFileSelect}
                                    placeholder={'Select base file...'} value={baseFile} isSmStyle
                                /> : ""}
                        </div>
                        <div className='col-md-3'>
                            <div className={`${transformedSchema && (transformedSchema.length == 1) && transformedSchema[0].schema != '' ? '' : ' d-none'}`}>
                                <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema[0].schema} customClass={`float-right`} />
                                <SBSaveFile data={transformedSchema[0].schema} loc={'schemas'} customClass={`mr-1 float-right`} filename={baseFile} ext={transformedSchema[0].schema_fmt || 'jadn'} />
                                <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right`} filename={baseFile} data={transformedSchema[0].schema} ext={transformedSchema[0].schema_fmt || 'jadn'} />
                            </div>

                            {props.isLoading ? <SBSpinner action={'Transforming'} /> : <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right"
                                disabled={isTransformDisabled}
                                title={"Process JADN schema(s) to produce another JADN schema"}>
                                Transform 
                            </Button>}
                        </div>
                    </div>
                </Form>
            </div>
            <div className="card-body-page">
                {transformedSchema.length > 1 ? transformedSchema.map((output, i: number) => (
                    <div className="card" key={i}>
                        <div className="card-header">
                            <h5 className="mb-0">
                                <button className="btn btn-link" id={`toggleSchema#${i}`} type="button" onClick={() => onToggle(i)} >
                                    {output.schema_name}
                                </button>
                                <SBCopyToClipboard buttonId={`copySchema${i}`} data={output.schema} customClass='float-right' />
                                <SBSaveFile data={output.schema} loc={'schemas'} customClass={"float-right mr-1"} filename={`${output.schema_name}`} ext={'jadn'} />
                                <SBDownloadFile buttonId={`downloadSchema${i}`} customClass='mr-1 float-right' filename={`${output.schema_name}`} data={output.schema} ext={'jadn'} />
                            </h5>
                        </div>

                        {toggle == `${i}` ?
                            <div className="card-body" key={i}>
                                <SBEditor data={output.schema} isReadOnly={true} height={'35vh'}></SBEditor>
                            </div> : ''}
                    </div>
                )) :
                    <SBEditor data={transformedSchema[0].schema} isReadOnly={true}></SBEditor>}
            </div>
        </div>
    )
})
export default SchemaTransformed;