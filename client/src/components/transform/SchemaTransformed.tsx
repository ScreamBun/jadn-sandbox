import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
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
    const { isLoading, onLoading, onSelectedSchemaReplaceAll, selectedSchemas } = props;
    const dispatch = useDispatch();

    const transformationOpts = useSelector(getValidTransformations);

    const [toggle, setToggle] = useState<{ [key: string]: boolean }>({});
    const [isTransformDisabled, setIsTransformDisabled] = useState(true);
    const [baseFile, setBaseFile] = useState<Option | null>();
    const [transformationType, setTransformationType] = useState<Option | null>();
    const [baseFileOpts, setBaseFileOpts] = useState<String[]>([]);
    const [transformedSchema, setTransformedSchema] = useState([initTransformedSchema]);

    const strip_comments: string = 'strip comments';
    const resolve_references: string = 'resolve references';

    useEffect(() => {
        setTransformedSchema([initTransformedSchema]);
        setBaseFile(null);
    }, [selectedSchemas]);

    useEffect(() => {
        setIsTransformDisabled(true);
        if (selectedSchemas && selectedSchemas.length > 0 && transformationType && transformationType.value) {
            if (transformationType.value == strip_comments) {
                setIsTransformDisabled(false);
            }
            if (transformationType.value == resolve_references && baseFile) {
                setIsTransformDisabled(false);
            }
        }

        let base_opts: String[] = selectedSchemas.map((ss: SelectedSchema) => { return (ss.name) });
        setBaseFileOpts(base_opts);

    }, [selectedSchemas, baseFile, transformationType]);

    // Allows parent to call child function
    useImperativeHandle(ref, () => ({
        onReset() {
            setToggle({});
            setBaseFile(null);
            setTransformedSchema([initTransformedSchema]);
            setTransformationType(null);
        },
    }));

    const onToggle = (index: number) => {
        setToggle((prev) => ({ ...prev, [index]: !prev[index] }));
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
        onLoading(true);
        const selectedBasefile = baseFile?.value ? baseFile.value : '';
        dispatch(transformSchema(selectedSchemas, transformationType.value, selectedBasefile))
            .then((val) => {
                if (val.error == true) {
                    let invalid_schema_list: any[] = [];
                    if (typeof val.payload.response == "object") {

                        val.payload.response.forEach((schema) => {
                            sbToastError(`${schema.name} : ${schema.err}`);
                            invalid_schema_list.push(schema.name);
                        });

                        // invalidate selectedFiles 
                        const invalidFiles = selectedSchemas.map((ss) => {
                            if (invalid_schema_list.includes(ss.name)) {
                                return { ...ss, 'data': 'err' };
                            } else {
                                return ss;
                            }
                        });
                        onSelectedSchemaReplaceAll(invalidFiles);

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
                onLoading(false);
            });
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <form onSubmit={submitForm}>
                    <div className='row no-gutters'>
                        <div className='col-md-9'>
                            <div className="row">
                                <div className="col-sm-6">
                                    <SBSelect id={"transformation-list"} data={transformationOpts} onChange={onSelectTypeChange}
                                        placeholder={'Select transformation type...'} value={transformationType} isSmStyle
                                    />
                                </div>
                                <div className={`col-sm-6 ${transformationType?.value == 'resolve references' ? '' : ' d-none'}`}>
                                    <SBSelect id={"base-file"} data={baseFileOpts} onChange={onBaseFileSelect}
                                        placeholder={'Select base file...'} value={baseFile} isSmStyle
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='col-md-3'>
                            <div className={`${transformedSchema && (transformedSchema.length == 1) && transformedSchema[0].schema != '' ? '' : ' d-none'}`}>
                                <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema[0].schema} customClass={`float-end`} />
                                <SBSaveFile data={transformedSchema[0].schema} loc={'schemas'} customClass={`me-1 float-end`} filename={baseFile?.value} ext={transformedSchema[0].schema_fmt || 'jadn'} />
                                <SBDownloadFile buttonId='schemaDownload' customClass={`me-1 float-end`} filename={baseFile?.value} data={transformedSchema[0].schema} ext={transformedSchema[0].schema_fmt || 'jadn'} />
                            </div>

                            {isLoading ? <SBSpinner action={'Transforming'} /> :
                                <button type="submit" id="transformSchema" className="btn btn-success btn-sm me-1 float-end"
                                    disabled={isTransformDisabled}
                                    title={"Process JADN schema(s) to produce another JADN schema"}>
                                    Transform
                                </button>}
                        </div>
                    </div>
                </form>
            </div>
            <div className="card-body-page">
                {transformedSchema.length > 1 ? transformedSchema.map((output, i: number) => (
                    <div className="card" key={i}>
                        <div className="card-header">
                            <h5 className="mb-0">
                                <button className="btn btn-link" id={`toggleSchema#${i}`} type="button" onClick={() => onToggle(i)} >
                                    {output.schema_name}
                                </button>
                                <SBCopyToClipboard buttonId={`copySchema${i}`} data={output.schema} customClass='float-end' />
                                <SBSaveFile data={output.schema} loc={'schemas'} customClass={"float-end me-1"} filename={`${output.schema_name}`} ext={'jadn'} />
                                <SBDownloadFile buttonId={`downloadSchema${i}`} customClass='me-1 float-end' filename={`${output.schema_name}`} data={output.schema} ext={'jadn'} />
                            </h5>
                        </div>

                        {toggle[i] == true ?
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