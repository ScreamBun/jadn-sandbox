import React, { useState } from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBSpinner from "components/common/SBSpinner";
import SBSelect, { Option } from "components/common/SBSelect";
import SBSaveFile from "components/common/SBSaveFile";
import { useSelector } from "react-redux";
import { getValidTransformations } from "reducers/transform";
import { initTransformedSchema } from "./SchemaTransformer";

const SchemaTransformed = (props: any) => {

    const { transformedSchema, data, transformationType, setTransformationType, setTransformedSchema, isLoading, baseFile, setBaseFile, selectedFiles } = props;
    const [toggle, setToggle] = useState('');
    const transformationOpts = useSelector(getValidTransformations);
    const baseFileOpts = selectedFiles.map((file: { name: any; }) => { return (file.name); });

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');
        } else {
            setToggle(`${index}`);
        }
    }

    const onSelectChange = (e: Option) => {
        setBaseFile(null);
        setTransformedSchema([initTransformedSchema]);
        setTransformationType(e);
    }

    const onBaseFileSelect = (e: Option) => {
        setTransformedSchema([initTransformedSchema]);
        setBaseFile(e);
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <SBSelect id={"transformation-list"} data={transformationOpts} onChange={onSelectChange}
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

                        {isLoading ? <SBSpinner action={'Transforming'} /> : <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right"
                            disabled={data.length != 0 && transformationType && (transformationType?.value == 'resolve references' ? (baseFile ? true : false) : true) ? false : true}
                            title={"Process JADN schema(s) to produce another JADN schema"}>
                            Transform
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body-page">

                {transformedSchema.length > 1 ? transformedSchema.map((output: { schema_name: string; schema: Record<string, any>; }, i: number) => (
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
                                <SBEditor data={output.schema} isReadOnly={true} height={'20em'}></SBEditor>
                            </div> : ''}
                    </div>
                )) :
                    <SBEditor data={transformedSchema[0].schema} isReadOnly={true}></SBEditor>}
            </div>
        </div>
    )
}
export default SchemaTransformed;