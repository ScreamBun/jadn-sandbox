import React from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";
import SBSelect, { Option } from "components/common/SBSelect";

const SchemaTransformed = (props: any) => {

    const { transformedSchema, data, setTransformationType, isLoading } = props;

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <SBSelect id={"transformation-list"} data={['Resolve references', 'Strip comments']} onChange={(e: Option) => setTransformationType(e.value)}
                            placeholder={'Select transformation type...'}
                        />
                    </div>
                    <div className='col-md-3'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema} customClass='float-right' />
                        <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${transformedSchema ? '' : ' d-none'}`} data={transformedSchema} />

                        {isLoading ? <Spinner action={'Transforming'} /> : <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right"
                            disabled={data.length != 0 ? false : true}
                            title={"Process JADN schema(s) to produce another JADN schema"}>
                            Transform
                        </Button>}
                    </div>
                </div>
            </div>
            <div className="card-body p-0">
                <SBEditor data={transformedSchema} isReadOnly={true} ></SBEditor>
            </div>
        </div>
    )
}
export default SchemaTransformed;