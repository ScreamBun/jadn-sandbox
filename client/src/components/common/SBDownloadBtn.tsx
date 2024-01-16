import React, { useState } from "react";
import { faFileDownload, faFileImage, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";
import SBSpinner from "./SBSpinner";
import { FormatJADN } from "components/utils";
import saveAs from "file-saver";
import { FILENAME_RULE, FILE_TYPE_PDF, FILE_TYPE_PNG, FILE_TYPE_SVG, LANG_JADN } from "components/utils/constants";

export const onDownloadPNGClick = (pumlURL: any, filename: string = "plantuml") => {
    saveAs(pumlURL, `${filename}.png`);
}

export const onDownloadSVGClick = (e: React.MouseEvent<HTMLButtonElement>, filename: string = "graphviz") => {
    e.preventDefault();
    const svg = document.getElementById("fullGV")?.innerHTML;
    if (svg) {
        var blob = new Blob([svg], { type: "image/svg+xml" });
        saveAs(blob, `${filename}.svg`);
    } else {
        sbToastError('Error: Unable to download GraphViz file.')
    }
}
//TODO: Add ability to save in other extensions ? 
const SBDownloadBtn = (props: any) => {

    const { buttonId, data, customClass, filename, ext = LANG_JADN } = props;

    const [fileNameInput, setFileNameInput] = useState(filename);
    const [toggleDownloadDialog, setToggleDownloadDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileNameInput(e.target.value);
    }

    const onDownloadIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setToggleDownloadDialog(true);
    }

    const onDownloadFileClick = (e: React.MouseEvent<HTMLButtonElement>, fmt: string) => {
        e.preventDefault();
        if (!data) {
            sbToastError('No data to download');
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
            sbToastSuccess('File downloaded')

        } catch (err) {
            console.log(err);
            sbToastError(`File cannot be downloaded`);
        }
    }

    const onDownloadPDFClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

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
                console.log(err);
                sbToastError(`PDF cannot be downloaded`);
            });

        } catch (err) {
            console.log(err);
            sbToastError(`PDF cannot be downloaded`);
        }

        sbToastSuccess('PDF downloaded successfully');
    }


    let icon;
    if (ext == FILE_TYPE_PDF) {
        icon = <FontAwesomeIcon icon={faFilePdf} />;
    } else if (ext == FILE_TYPE_SVG || ext == FILE_TYPE_PNG) {
        icon = <FontAwesomeIcon icon={faFileImage} />;
    } else {
        icon = <FontAwesomeIcon icon={faFileDownload} />;
    }


    const onDownloadClick = (e: React.MouseEvent<HTMLButtonElement>, fmt: string) => {
        e.preventDefault();
        if (fileNameInput == '' || fileNameInput == undefined) {
            sbToastWarning('Please enter a file name.');
            return;
        } else if (!FILENAME_RULE.test(fileNameInput)) {
            sbToastWarning("Please do not use special characters in file name.");
            return;
        }

        switch (fmt) {
            case FILE_TYPE_PDF:
                onDownloadPDFClick(e);
                break;
            case FILE_TYPE_SVG:
                onDownloadSVGClick(e, fileNameInput);
                break;
            case FILE_TYPE_PNG:
                onDownloadPNGClick(data, fileNameInput);
                break;
            default:
                //jadn, json, html, md, gv, puml, jidl
                onDownloadFileClick(e, ext);
        }

        setIsLoading(false);
        setToggleDownloadDialog(false);
    }

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> :
                <button id={buttonId || 'downloadBtn'} type='button' title={`Download ${ext} File`} className={'btn btn-sm btn-primary ' + customClass} onClick={onDownloadIconClick}>
                    {icon}
                </button>}

            <div id="downloadFileModal" className={`modal fade ${toggleDownloadDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className={`modal-dialog modal-dialog-centered`} role='document'>
                    <div className='modal-content'>
                        <div className="modal-header">
                            <div className="form col">
                                <div className="form row">
                                    <h5 className='modal-title'>
                                        Download As...
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
                                    <input type="text" readOnly className="form-control-plaintext" id="downloadFileAsType" value={ext} />
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
export default SBDownloadBtn;