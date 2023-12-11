import React, { useState } from "react";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sbToastError, sbToastInfo } from "./SBToast";
import SBSpinner from "./SBSpinner";

const SBDownloadPDF = (props: any) => {

    const { buttonId, data, customClass } = props;

    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleDownloadDialog, setToggleDownloadDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFileNameInput(e.target.value);
    }

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsLoading(false);
        setToggleDownloadDialog(false);
    }

    const onDownloadIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data) {
            sbToastError('No data to download');
            return;
        }
        setToggleDownloadDialog(true);
    }

    const onDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (fileNameInput == '') {
            alert('Please enter a file name.');
            return;
        }
        const filename = `${fileNameInput}.pdf`;
        setIsLoading(true);
        try {
            fetch('/api/convert/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    schema: data
                })
            }).then(
                rsp => rsp.blob()
            ).then(blob => {
                const elem = document.createElement('a');
                elem.href = URL.createObjectURL(blob);
                elem.download = filename;
                document.body.appendChild(elem);
                elem.click();

                elem.remove();
                URL.revokeObjectURL(elem.href);
            }).catch(err => {
                setIsLoading(false);
                console.log(err);
                sbToastError(`PDF cannot be downloaded`);
            });

        } catch (err) {
            setIsLoading(false);
            console.log(err);
            sbToastError(`PDF cannot be downloaded`);
        }
        setIsLoading(false);
        sbToastInfo('Downloading PDF...');
        setToggleDownloadDialog(false);
    }

    return (
        <>
            {isLoading ? <SBSpinner color={'info'} /> :
                <button id={buttonId || 'downloadPDF'} type='button' title="Download PDF" className={'btn btn-sm btn-primary ' + customClass} onClick={onDownloadIconClick}>
                    <FontAwesomeIcon icon={faFilePdf} />
                </button>}

            <div id="downloadPDFModal" className={`modal fade ${toggleDownloadDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className={`modal-dialog modal-dialog-centered`} role='document'>
                    <div className='modal-content'>
                        <div className="modal-header">
                            <h5 className='modal-title'>
                                Save PDF As...
                            </h5>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={() => setToggleDownloadDialog(false)} />
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <label htmlFor={buttonId + "filenamePDFDownload"} className="col-sm-4 col-label">File name:</label>
                                <div className="col-sm-8">
                                    <input id={buttonId + "filenamePDFDownload"} className="form-control" type="text" onChange={onChange} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-sm btn-success' onClick={onDownloadClick}>Save</button>
                            <button type='button' className='btn btn-sm btn-secondary' onClick={onCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
                <div className={`modal-backdrop fade ${toggleDownloadDialog ? 'show' : ''}`} style={{
                    zIndex: -1
                }}></div>
            </div>
        </>
    )
}
export default SBDownloadPDF;