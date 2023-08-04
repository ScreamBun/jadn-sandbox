import React, { useState } from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";
import SBSaveFile from "components/common/SBSaveFile";
import { FormatJADN } from "components/utils";

const SchemaTransformed = (props: any) => {

    const { transformedSchema, data, transformationType, setTransformationType, isLoading } = props;
    const [toggle, setToggle] = useState('');

    const onToggle = (index: number) => {
        if (toggle == index.toString()) {
            setToggle('');

        } else {
            setToggle(`${index}`);
        }
    }
    console.log(transformedSchema)
    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <SBSelect id={"transformation-list"} data={['Resolve references', 'Strip comments']} onChange={(e: Option) => setTransformationType(e)}
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

                {transformedSchema.length > 1 ? transformedSchema.map((output: string, i: number) => (
                    <div className="card" key={i}>
                        <div className="card-header">
                            <h5 className="mb-0">
                                <button className="btn btn-link" id={`toggleMsg#${i}`} type="button" onClick={() => onToggle(i)} >
                                    {output.schema_name}
                                </button>
                                <SBCopyToClipboard buttonId={`copyMsgExample${i}`} data={output.schema} customClass='float-right' />
                                <SBSaveFile data={output.schema} loc={'messages'} customClass={"float-right mr-1"} filename={`MessageExample${i + 1}`} ext={'json'} />
                                <SBDownloadFile buttonId={`downloadMsgExample${i}`} customClass='mr-1 float-right' filename={`MessageExample${i + 1}`} data={output.schema} ext={'json'} />
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