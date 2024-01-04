import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { saveFile } from "actions/save";
import { info } from "actions/util";
import { FormatJADN } from "components/utils";
import { FILENAME_RULE, LANG_JADN } from "components/utils/constants";
import SBSpinner from "./SBSpinner";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";

const SBSaveFile = (props: any) => {

    const dispatch = useDispatch();

    const { buttonId, toolTip, data, customClass, filename = '', ext = LANG_JADN, loc, setDropdown } = props;
    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleSaveDialog, setToggleSaveDialog] = useState(false);
    const [toggleOverwriteDialog, setToggleOverwriteDialog] = useState(false); //nestedModal
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFileNameInput(e.target.value);
    }

    const onSaveIconClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!data) {
            sbToastError('No data to save');
            return;
        }
        setToggleSaveDialog(true);
        setFileNameInput(filename);
    }

    const onSaveFile = (e: React.MouseEvent<HTMLButtonElement>, fmt: string, overwrite: boolean = false) => {
        e.preventDefault();
        if (fileNameInput == '') {
            sbToastWarning('Please enter a file name.');
            return;
        } else if (!FILENAME_RULE.test(fileNameInput)) {
            sbToastWarning("Please do not use special characters in file name.");
            return;
        }

        const filename = `${fileNameInput}.${fmt}`;
        let formattedData = typeof data == "object" ? FormatJADN(data) : data;
        setIsLoading(true);
        try {
            dispatch(saveFile(filename, formattedData, loc, overwrite))
                .then((val) => {
                    setIsLoading(false);
                    if (val.error) {
                        if (val.payload.status == 409) {
                            setToggleOverwriteDialog(true);
                            return;
                        }
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
                    onClick={onSaveIconClick}>
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
                            <div className="row">
                                <label htmlFor={buttonId + "filenameSave"} className="col-sm-4 col-label">File name:</label>
                                <div className="col-sm-8">
                                    <input id={buttonId + "filenameSave"} className="form-control" type="text" autoFocus={true} value={fileNameInput} onChange={onChange} />
                                </div>
                            </div>
                            <div className="row">
                                <label htmlFor={buttonId + "saveFileAsType"} className="col-sm-4 col-label">Save as type:</label>
                                <div className="col-sm-8">
                                    <input type="text" readOnly className="form-control-plaintext" id={buttonId + "saveFileAsType"} value={ext} />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-success' onClick={(e) => onSaveFile(e, ext)}>Save</button>
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
                            File <b>{filename}</b> already exists. Please confirm that you would like to overwrite this file?
                        </div>
                        <div className="modal-footer">
                            <button type='button' className='btn btn-success' onClick={(e) => onSaveFile(e, ext, true)}>Confirm</button>
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