import React, { forwardRef } from "react";
import SBSaveFile from "./SBSaveFile";
import SBSelect, { Option } from "./SBSelect";
import { useDispatch } from "react-redux";
import { loadFile } from "actions/util";
import { sbToastError } from "./SBToast";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LANG_JADN } from "components/utils/constants";

interface SBFileLoaderProps {
    customClass?: string;
    opts: any[];
    selectedOpt: Option | null;
    setSelectedFile?: (fileOpt: Option | null) => void;
    placeholder: string;
    loc: 'schemas' | 'messages';
    onCancelFileUpload: (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLInputElement> | null) => void;
    onFileChange: (fileData?: string | ArrayBuffer | null, fileName?: Option | undefined) => void;
    acceptableExt?: string[] | undefined;
    isSaveable?: boolean;
    loadedFileData?: any;
    fileName?: {
        name: string,
        ext: string
    };
    fileExt?: string;
}

const SBFileLoader = forwardRef(function SBLoadSchema(props: SBFileLoaderProps, ref) {
    const dispatch = useDispatch();
    const { customClass, opts, selectedOpt, loadedFileData,
        setSelectedFile, placeholder, loc,
        acceptableExt, onCancelFileUpload, onFileChange,
        isSaveable, fileName, fileExt = LANG_JADN } = props;

    const handleFileSelect = (e: Option) => {
        if (e == null) {
            onCancelFileUpload(null);
            return;

        } else if (e.value == "file") {
            ref.current.value = '';
            ref.current?.click();

        } else {
            dispatch(loadFile(loc, e.value))
                .then(async (loadFileVal) => {
                    if (loadFileVal.error) {
                        sbToastError(loadFileVal.payload.response);
                        return;
                    }
                    let dataObj = loadFileVal.payload.data;
                    onFileChange(dataObj, e);
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
                    onFileChange(dataStr, { value: file.name, label: file.name });
                }
            };
            fileReader.readAsText(file);
        }
    }

    return (
        <>
            <div className={`d-flex + ${customClass}`}>
                <SBSelect id={"file-select"}
                    data={opts}
                    onChange={handleFileSelect}
                    placeholder={placeholder}
                    loc={loc}
                    value={selectedOpt}
                    isGrouped
                    isFileUploader
                    isSmStyle
                    isClearable
                />
                {isSaveable && <SBSaveFile buttonId="saveFile" toolTip={'Save as..'} data={loadedFileData} loc={loc} customClass={"float-end ms-1"}
                    filename={fileName?.name} ext={fileExt} setDropdown={setSelectedFile} />}
            </div>
            <div className='d-none'>
                <input type="file" id="file-input" name="file-input" accept={'.jadn, ' + acceptableExt} onChange={handleFileChange} ref={ref} />
                <button id="cancelFileUpload" type='button' className="btn btn-sm btn-secondary ms-0" onClick={() => onCancelFileUpload} style={{ display: 'inline' }}>
                    <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
                </button>
            </div >
        </>
    );
});

export default SBFileLoader;