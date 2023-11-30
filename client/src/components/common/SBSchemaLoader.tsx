import React, { forwardRef } from "react";
import SBFileUploader from "./SBFileUploader";
import SBSaveFile from "./SBSaveFile";
import SBSelect, { Option } from "./SBSelect";
import { useDispatch } from "react-redux";
import { loadFile } from "actions/util";
import { getFilenameOnly, getFilenameExt } from "components/utils/general";
import { sbToastError } from "./SBToast";

const SBSchemaLoader = forwardRef(function SBSchemaLoader(props: any, ref) {
    const dispatch = useDispatch();
    const { schemaOpts, selectedSchemaOpt,
        loadedSchema, fileName, schemaFormat, setSelectedFile,
        acceptFormat, onCancelFileUpload, onFileChange,
        setFileName } = props;

    const handleFileSelect = (e: Option) => {
        if (e == null) {
            setSelectedFile(e);
            const fileName = {
                name: '',
                ext: 'jadn'
            }
            setFileName(fileName);
            onFileChange(null);
            return;

        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();

        } else {
            setSelectedFile(e);
            const fileName = {
                name: getFilenameOnly(e.label),
                ext: getFilenameExt(e.label)
            }
            setFileName(fileName);

            dispatch(loadFile('schemas', e.value))
                .then((loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    let schemaObj = loadFileVal.payload.data;
                    let schemaStr = JSON.stringify(schemaObj);
                    onFileChange(schemaStr);
                })
                .catch((loadFileErr) => {
                    console.log(loadFileErr)
                    sbToastError(loadFileErr.payload.data);
                })
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();

        if (e.target.files && e.target.files.length != 0) {
            const file = e.target.files[0];
            setSelectedFile({ 'value': file.name, 'label': file.name });
            const fileName = {
                name: getFilenameOnly(file.name),
                ext: getFilenameExt(file.name)
            }
            setFileName(fileName);

            const fileReader = new FileReader();
            fileReader.onload = (ev: ProgressEvent<FileReader>) => {
                if (ev.target) {
                    let dataStr = ev.target.result;
                    try {
                        onFileChange(dataStr);
                    } catch (err) {
                        sbToastError(`File cannot be loaded: Invalid JSON`);
                    }
                }
            };
            fileReader.readAsText(file);
        }
    }

    const handleCancelFileUpload = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setSelectedFile(null);
        if (ref.current) {
            ref.current.value = '';
        }
        onCancelFileUpload();
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
                <SBFileUploader ref={ref} id={"schema-file"} accept={'.jadn, ' + acceptFormat} onCancel={handleCancelFileUpload} onChange={handleFileChange} />
            </div>
        </>
    );
});

export default SBSchemaLoader;