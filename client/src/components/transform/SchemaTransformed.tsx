import React, { useState } from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";
import SBSaveFile from "components/common/SBSaveFile";
import { FormatJADN } from "components/utils";
import { useSelector } from "react-redux";
import { getValidTransformations } from "reducers/transform";

const SchemaTransformed = (props: any) => {

    const { transformedSchema, data, transformationType, setTransformationType, isLoading } = props;
    const [toggle, setToggle] = useState('');
    const transformationOpts = useSelector(getValidTransformations);

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <SBSelect id={"transformation-list"} data={transformationOpts} onChange={(e: Option) => setTransformationType(e)}
                            placeholder={'Select transformation type...'} value={transformationType}
                        />
                    </div>
                    <div className='col-md-3'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema} customClass='float-right' />
                        <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${transformedSchema ? '' : ' d-none'}`} data={transformedSchema} />

                        {isLoading ? <Spinner action={'Transforming'} /> : <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right"
                            disabled={data.length != 0 && transformationType ? false : true}
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