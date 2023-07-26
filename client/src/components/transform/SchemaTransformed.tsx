import React from "react";
import { Button } from "reactstrap";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import SBDownloadFile from "components/common/SBDownloadFile";
import Spinner from "components/common/Spinner";

const SchemaTransformed = (props: any) => {

    const { transformedSchema, data, transformationType, setTransformationType, isLoading } = props;

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-9'>
                        <select id="transformation-type" name="transformation-type" className="form-control form-control-sm" value={transformationType} onChange={(e) => setTransformationType(e.target.value)}>
                            <option value="" disabled>Select a Transformation Type...</option>
                            <option value="resolve-refs">Resolve references</option>
                            <option value="strip-comments">Strip comments</option>
                        </select>
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