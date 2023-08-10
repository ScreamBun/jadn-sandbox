import React, { useState } from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import SBSpinner from "components/common/SBSpinner";
import SBSelect, { Option } from "components/common/SBSelect";
import SBSaveFile from "components/common/SBSaveFile";
import { FormatJADN } from "components/utils";
import { useSelector } from "react-redux";
import { getValidTransformations } from "reducers/transform";

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
        setTransformedSchema([]);
        setTransformationType(e);
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <SBSelect id={"transformation-list"} data={transformationOpts} onChange={onSelectChange}
                            placeholder={'Select transformation type...'} value={transformationType}
                        />
                        {transformationType?.value == 'resolve references' ?
                            <SBSelect id={"base-file"} data={baseFileOpts} onChange={(e: Option) => { setTransformedSchema([]); setBaseFile(e); }}
                                placeholder={'Select base file...'} value={baseFile}
                            /> : ""}
                    </div>
                    <div className='col-md-3'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema.length == 1 ? FormatJADN(transformedSchema[0].schema) : transformedSchema.schema} customClass={`float-right${transformedSchema && (transformedSchema.length == 1) ? '' : ' d-none'}`} />
                        <SBSaveFile data={transformedSchema.length == 1 ? FormatJADN(transformedSchema[0].schema) : transformedSchema.schema} loc={'schemas'} customClass={`mr-1 float-right${transformedSchema && (transformedSchema.length == 1) ? '' : ' d-none'}`} filename={transformedSchema.length == 1 ? transformedSchema[0].schema_name : baseFile} ext={transformedSchema.length == 1 ? transformedSchema[0].schema_fmt : 'jadn'} />
                        <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${transformedSchema && (transformedSchema.length == 1) ? '' : ' d-none'}`} filename={transformedSchema.length == 1 ? transformedSchema[0].schema_name : baseFile} data={transformedSchema.length == 1 ? FormatJADN(transformedSchema[0].schema) : transformedSchema.schema} ext={transformedSchema.length == 1 ? transformedSchema[0].schema_fmt : 'jadn'} />

                        {isLoading ? <SBSpinner action={'Transforming'} /> : <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right"
                            disabled={data.length != 0 && (transformationType?.value == 'resolve references' ? baseFile : true) ? false : true}
                            title={"Process JADN schema(s) to produce another JADN schema"}>
                            Transform
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body p-0">

                {transformedSchema.length > 1 ? transformedSchema.map((output: { schema_name: string; schema: Record<string, any>; }, i: number) => (
                    <div className="card" key={i}>
                        <div className="card-header">
                            <h5 className="mb-0">
                                <button className="btn btn-link" id={`toggleSchema#${i}`} type="button" onClick={() => onToggle(i)} >
                                    {output.schema_name}
                                </button>
                                <SBCopyToClipboard buttonId={`copySchema${i}`} data={output.schema} customClass='float-right' />
                                <SBSaveFile data={output.schema} loc={'messages'} customClass={"float-right mr-1"} filename={`${output.schema_name}`} ext={'json'} />
                                <SBDownloadFile buttonId={`downloadSchema${i}`} customClass='mr-1 float-right' filename={`${output.schema_name}`} data={output.schema} ext={'json'} />
                            </h5>
                        </div>

                        {toggle == `${i}` ?
                            <div className="card-body" key={i}>
                                <SBEditor data={FormatJADN(output.schema)} isReadOnly={true} height={'20em'}></SBEditor>
                            </div> : ''}
                    </div>
                )) :
                    <SBEditor data={transformedSchema.length == 1 ? FormatJADN(transformedSchema[0].schema) : transformedSchema.schema} isReadOnly={true}></SBEditor>}
            </div>
        </div>
    )
}
export default SchemaTransformed;