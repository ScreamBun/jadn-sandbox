import React, { useState } from "react";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";
import SBSpinner from "./SBSpinner";
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

            const blob = new Blob([data], { type: "application/json" });
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
            {isLoading ? <SBSpinner color={"primary"} /> : <Button id={buttonId || 'downloadFile'} title="Download File" color="primary" className={'btn-sm ' + customClass} onClick={() => { setToggleDownloadDialog(true); setFileNameInput(filename); }}>
                <FontAwesomeIcon icon={faFileDownload} />
            </Button>}

            <Modal isOpen={toggleDownloadDialog} autoFocus={false}>
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
                    <Button color="success" onClick={() => onDownloadClick(ext)}>Download</Button>
                    <Button color="secondary" onClick={() => { setIsLoading(false); setToggleDownloadDialog(false); }}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
export default SBDownloadFile;