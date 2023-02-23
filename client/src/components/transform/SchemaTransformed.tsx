import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload, faFilePdf, faWindowMaximize } from "@fortawesome/free-solid-svg-icons";
import { getConversions } from "reducers/convert";
import { sbToastError } from "components/common/SBToast";
import SBCopyToClipboard from "components/common/SBCopyToClipboard";
import SBEditor from "components/common/SBEditor";
import { isNull } from "lodash";
import { useLocation } from "react-router-dom";

const SchemaTransformed = (props: any) => {

    const { transformedSchema } = props;

    const onDownloadSchemaClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (transformedSchema != '') {
            try {
                const data = transformedSchema;
                const filename = `schema.jadn`;

                const blob = new Blob([data], { type: "application/json" });
                const elem = document.createElement('a');
                elem.href = URL.createObjectURL(blob);
                elem.download = filename;
                document.body.appendChild(elem);
                elem.click();

                elem.remove();
                URL.revokeObjectURL(elem.href);
            } catch (err) {
                console.log(err);
                sbToastError(`File cannot be downloaded`);
            }
        } else {
            sbToastError(`No Converted Schema Exists`);
        }
    }

    return (
        <div className="card">
            <div className="card-header p-2">
                <div className='row no-gutters'>
                    <div className='col-md-3'>

                    </div>
                    <div className='col-md-9'>
                        <SBCopyToClipboard buttonId='copyConvertedSchema' data={transformedSchema} customClass='float-right' />
                        <Button id='schemaDownload' title="Download converted schema" color="info" className={`btn-sm mr-1 float-right${transformedSchema ? '' : ' d-none'}`} onClick={onDownloadSchemaClick}>
                            <FontAwesomeIcon icon={faFileDownload} />
                        </Button>

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