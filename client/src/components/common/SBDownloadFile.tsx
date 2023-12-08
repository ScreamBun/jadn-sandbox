import React, { useState } from "react";
import { faFileDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

    const onDownloadIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data) {
            sbToastError('No data to download');
            return;
        }
        setToggleDownloadDialog(true);
        setFileNameInput(filename);
    }

    const onDownloadClick = (e: React.MouseEvent<HTMLButtonElement>, fmt: string = 'jadn') => {
        e.preventDefault();
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
                <button id={buttonId || 'downloadFile'} type='button' title="Download File" className={'btn btn-sm btn-primary ' + customClass} onClick={onDownloadIconClick}>
                    <FontAwesomeIcon icon={faFileDownload} />
                </button>}

            <div id="downloadFileModal" className={`modal fade ${toggleDownloadDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className={`modal-dialog modal-dialog-centered`} role='document'>
                    <div className='modal-content'>
                        <div className="modal-header">
                            <div className="form col">
                                <div className="form row">
                                    <h5 className='modal-title'>
                                        Download File As...
                                    </h5>
                                </div>
                                <div className="form row">
                                    <small className="text-muted"> {`Download file to local computer`}</small>
                                </div>
                            </div>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={() => setToggleDownloadDialog(false)} />
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <label htmlFor="filenameDownload" className="col-sm-4 col-label">File name:</label>
                                <div className="col-sm-8">
                                    <input id='filenameDownload' className="form-control" type="text" autoFocus={true} value={fileNameInput} onChange={onChange} />
                                </div>
                            </div>
                            <div className="row">
                                <label htmlFor="downloadFileAsType" className="col-sm-4 col-label">Save as type:</label>
                                <div className="col-sm-8">
                                    <input type="text" readOnly className="form-control-plaintext" id="downloadFileAsType" value={ext ? ext : 'jadn'} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-sm btn-success' onClick={(e) => onDownloadClick(e, ext)}>Download</button>
                            <button type='button' className='btn btn-sm btn-secondary' onClick={() => { setIsLoading(false); setToggleDownloadDialog(false); }}>Cancel</button>
                        </div>
                    </div>
                </div>
                <div className={`modal-backdrop fade ${toggleDownloadDialog ? 'show' : ''}`} style={{
                    zIndex: -1
                }}>
                </div>
            </div>
        </>
    )
}
export default SBDownloadFile;