import React, { useState } from "react";
import { saveFile } from "actions/save";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";
import { useDispatch } from "react-redux";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { info } from "actions/util";
import SBSpinner from "./SBSpinner";
import { FormatJADN } from "components/utils";

const SBSaveFile = (props: any) => {

    const dispatch = useDispatch();

    const { buttonId, toolTip, data, customClass, filename, ext, loc, setDropdown } = props;
    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleSaveDialog, setToggleSaveDialog] = useState(false);
    const [toggleOverwriteDialog, setToggleOverwriteDialog] = useState(false); //nestedModal
    const [isLoading, setIsLoading] = useState(false);

    const fileNameRule = "/^\w+$/";


    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFileNameInput(e.target.value);
    }

    const onSaveFile = (dataStr: string, fmt: string = 'jadn', overwrite: boolean = false) => {
        if (dataStr == '{}') {
            sbToastError('Error: No data to save.');
            return;
        }

        if (fileNameInput == '') {
            sbToastWarning('Please enter a file name.');
            return;
        } else if (fileNameInput.match(fileNameRule)) {
            sbToastWarning("Please do not use special characters in file name.");
            return;
        }

        const filename = `${fileNameInput}.${fmt}`;
        let formattedData = typeof data == "object" ? FormatJADN(data) : data;
        setIsLoading(true);
        try {
            dispatch(saveFile(filename, formattedData, loc, overwrite))
                .then((val) => {
                    if (val.error) {
                        if (val.payload.status == 409) {
                            setIsLoading(false);
                            setToggleOverwriteDialog(true);
                            return;
                        }
                        setIsLoading(false);
                        sbToastError(`Error: ${val.payload.response}`);
                        setToggleSaveDialog(false);
                        setToggleOverwriteDialog(false);
                        return;
                    }
                    setIsLoading(false);
                    sbToastSuccess(val.payload);
                    setToggleSaveDialog(false);
                    setToggleOverwriteDialog(false);
                    setDropdown({ label: filename, value: filename });
                    dispatch(info());
                })
                .catch((err) => {
                    setIsLoading(false);
                    sbToastError(`Error: ${err.payload.response}`);
                    setToggleSaveDialog(false);
                    setToggleOverwriteDialog(false);
                });
        } catch (err) {
            setIsLoading(false);
            sbToastError(`Error: ${err.payload.response}`);
            setToggleSaveDialog(false);
            setToggleOverwriteDialog(false);
        }
    }

    return (
        <>
            {isLoading ? <SBSpinner color={"primary"} /> :
                <button type='button' id={buttonId || 'saveFile'}
                    title={toolTip || "Save File"}
                    className={'btn btn-primary btn-sm ' + customClass}
                    onClick={() => { setToggleSaveDialog(true); setFileNameInput(filename); }}>
                    <FontAwesomeIcon icon={faSave} />
                </button>
            }

            <div id="saveFileModal" className={`modal fade ${toggleSaveDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className={`modal-dialog modal-dialog-centered`} role='document'>
                    <div className='modal-content'>
                        <div className="modal-header">
                            <div className="form-col">
                                <div className="form-row">
                                    <h5 className='modal-title'>
                                        Save File As...
                                    </h5>
                                </div>
                                <div className="form-row">
                                    <small className="text-muted"> {`Save file in pre-populated list of ${loc}`}</small>
                                </div>
                            </div>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={() => setToggleSaveDialog(false)} />
                        </div>
                        <div className="modal-body">
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
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-success' onClick={() => onSaveFile(data, ext)}>Save</button>
                            <button type='button' className='btn btn-secondary' onClick={() => setToggleSaveDialog(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
                <div className={`modal-backdrop fade ${toggleSaveDialog ? 'show' : ''}`} style={{
                    zIndex: -1
                }}></div>
            </div>

            <div id="confirmationOverwriteModal" className={`modal fade ${toggleOverwriteDialog ? 'show d-block' : 'd-none'}`} tabIndex={-1} role='dialog'>
                <div className={`modal-dialog modal-dialog-centered`} role='document'>
                    <div className='modal-content'>
                        <div className="modal-header">
                            <h5 className='modal-title'>
                                Confirm Overwrite
                            </h5>
                            <button type='button' className='btn-close' data-bs-dismiss='modal' aria-label='Close' title='Close' onClick={() => setToggleOverwriteDialog(false)} />
                        </div>
                        <div className="modal-body">
                            File <strong>{filename}</strong> already exists. Please confirm that you would like to overwrite this file?
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-success' onClick={() => onSaveFile(data, ext, true)}>Confirm</button>
                            <button type='button' className='btn btn-secondary' onClick={() => { setIsLoading(false); setToggleOverwriteDialog(false); }}>Cancel</button>
                        </div>
                    </div>
                </div>
                <div className={`modal-backdrop fade ${toggleOverwriteDialog ? 'show' : ''}`} style={{
                    zIndex: -1
                }}></div>
            </div>
        </>
    );
}

export default SBSaveFile;