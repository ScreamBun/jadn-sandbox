import React, { forwardRef } from "react";
import SBFileUploader from "./SBFileUploader";
import SBSaveFile from "./SBSaveFile";
import SBSelect, { Option } from "./SBSelect";
import { useDispatch } from "react-redux";
import { loadFile } from "actions/util";
import { sbToastError } from "./SBToast";

const SBLoadSchema = forwardRef(function SBLoadSchema(props: any, ref) {
    const dispatch = useDispatch();
    const { schemaOpts, selectedSchemaOpt,
        loadedSchema, fileName, schemaFormat, setSelectedFile,
        acceptFormat, onCancelFileUpload, onFileChange } = props;

    const handleFileSelect = (e: Option) => {
        if (e == null) {
            onCancelFileUpload();
            return;

        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();

        } else {
            dispatch(loadFile('schemas', e.value))
                .then(async (loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    let schemaObj = loadFileVal.payload.data;
                    onFileChange(schemaObj, e.value);
                })
                .catch((loadFileErr) => {
                    sbToastError(loadFileErr.payload.data);
                    onFileChange();
                })
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let dataStr = ev.target.result;
                    onFileChange(dataStr, file.name);
                }
            };
            fileReader.readAsText(file);
        }
    }

    return (
        <>
            <div className="d-flex">
                <SBSelect id={"schema-list"} data={schemaOpts} onChange={handleFileSelect}
                    placeholder={'Select a schema...'}
                    loc={'schemas'}
                    value={selectedSchemaOpt}
                    isGrouped
                    isFileUploader
                    isSmStyle />
                <SBSaveFile buttonId="saveSchema" toolTip={'Save Schema'} data={loadedSchema} loc={'schemas'} customClass={"float-end ms-1"}
                    filename={fileName?.name} ext={schemaFormat} setDropdown={setSelectedFile} />
            </div>
            <div className='d-none'>
                <SBFileUploader ref={ref} id={"schema-file"} accept={'.jadn, ' + acceptFormat} onCancel={() => onCancelFileUpload} onChange={handleFileChange} />
            </div>
        </>
    );
});

export default SBLoadSchema;