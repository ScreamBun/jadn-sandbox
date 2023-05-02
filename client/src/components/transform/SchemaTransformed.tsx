import React from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";

const SchemaTransformed = (props: any) => {

    const { transformedSchema } = props;

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        Specify transformation type here..
                    </div>
                    <div className='col-md-3'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema} customClass='float-right' />
                        <SBDownloadFile buttonId='schemaDownload' customClass={`mr-1 float-right${transformedSchema ? '' : ' d-none'}`} data={transformedSchema} />

                        <Button color="success" type="submit" id="transformSchema" className="btn-sm mr-1 float-right">
                            Transform
                        </Button>
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