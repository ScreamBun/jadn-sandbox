import React, { useState } from "react";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";
import SBSpinner from "./SBSpinner";
import { FormatJADN } from "components/utils";
//TODO: Add ability to save in other extensions ? 
const SBDownloadFile = (props: any) => {

    const { buttonId, data, customClass, filename, ext } = props;

    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleDownloadDialog, setToggleDownloadDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileNameInput(e.target.value);
    }

    const onDownloadClick = (fmt: string = 'jadn') => {
        if (fileNameInput == '') {
            sbToastWarning('Please enter a file name.');
            return;
        } else if (fileNameInput.match(/[$&+,:;=?@#|'<>.^*()%!\\//]/)) {
            sbToastWarning("Please do not use special characters in file name.");
            return;
        }

        setIsLoading(true);
        try {
            const filename = `${fileNameInput}.${fmt}`;
            let formattedData = typeof data == "object" ? FormatJADN(data) : data;

            const blob = new Blob([formattedData], { type: "application/json" });
            //content: `data:application/json;charset=utf-8,${encodeURIComponent(FormatJADN(prevState.schema))}`
            const elem = document.createElement('a');
            elem.href = URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();

            // To make this work on Firefox we need to wait
            // a little while before removing it.
            setTimeout(() => {
                elem.remove();
                URL.revokeObjectURL(elem.href);
            }, 0);
            setIsLoading(false);
            sbToastSuccess('File downloaded')
        } catch (err) {
            console.log(err);
            setIsLoading(false);
            sbToastError(`File cannot be downloaded`);
        }
        setIsLoading(false);
        setToggleDownloadDialog(false);
    }

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> :
                <button id={buttonId || 'downloadFile'} type='button' title="Download File" className={'btn btn-sm btn-primary ' + customClass} onClick={() => { setToggleDownloadDialog(true); setFileNameInput(filename); }}>
                    <FontAwesomeIcon icon={faFileDownload} />
                </button>}

            <Modal isOpen={toggleDownloadDialog} autoFocus={false} returnFocusAfterClose={false}>
                <ModalHeader>
                    Download File As...
                    <div>
                        <small className="text-muted"> {`Download file to local computer`}</small>
                    </div>
                </ModalHeader>
                <ModalBody>
                    <div className="form-row">
                        <label htmlFor="filename" className="col-sm-4 col-form-label">File name:</label>
                        <div className="col-sm-8">
                            <input id='filename' className="form-control" type="text" autoFocus={true} value={fileNameInput} onChange={onChange} />
                        </div>
                    </div>
                    <div className="form-row">
                        <label htmlFor="filename" className="col-sm-4 col-form-label">Save as type:</label>
                        <div className="col-sm-8 my-auto">
                            {ext ? ext : 'jadn'}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button type='button' className='btn btn-sm btn-success' onClick={() => onDownloadClick(ext)}>Download</button>
                    <button type='button' className='btn btn-sm btn-secondary' onClick={() => { setIsLoading(false); setToggleDownloadDialog(false); }}>Cancel</button>
                </ModalFooter>
            </Modal>
        </>
    )
}
export default SBDownloadFile;