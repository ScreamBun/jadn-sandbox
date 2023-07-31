import React, { useState } from "react";
import { uploadSchema } from "actions/load";
import { sbToastError, sbToastSuccess, sbToastWarning } from "./SBToast";
import { useDispatch } from "react-redux";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const SBSaveFile = (props: any) => {

    const dispatch = useDispatch();

    const { buttonId, data, customClass, filename, ext, loc } = props;
    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleSaveDialog, setToggleSaveDialog] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileNameInput(e.target.value);
    }

    const onSaveFile = (dataStr: string, fmt: string = 'jadn') => {
        if (!dataStr) {
            sbToastError('Error: No data to save.');
            return;
        }

        if (fileNameInput == '') {
            sbToastWarning('Please enter a file name.');
            return;
        }

        const filename = `${fileNameInput}.${fmt}`;
        setToggleSaveDialog(false);

        try {
            dispatch(uploadSchema(filename, dataStr, loc))
                .then((val) => {
                    if (val.error) {
                        sbToastError(`Error: ${val.payload.response}`);
                        return;
                    }
                    sbToastSuccess(val.payload);
                })
                .catch((err) => {
                    sbToastError(`Error: ${err.payload.response}`);
                });
        } catch (err) {
            sbToastError(`Error: ${err.payload.response}`);
        }
    }

    return (
        <>
            <Button id={buttonId || 'saveFile'} title="Save File" color="info" className={'btn-sm ' + customClass} onClick={() => { setToggleSaveDialog(true); setFileNameInput(filename); }}>
                <FontAwesomeIcon icon={faSave} />
            </Button>

            <Modal isOpen={toggleSaveDialog} autoFocus={false} >
                <ModalHeader>
                    Save File As...
                    <div>
                        <small className="text-muted"> {`Save file in pre-populated list of ${loc}`}</small>
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
                    <Button color="success" onClick={() => onSaveFile(data, ext)}>Save</Button>
                    <Button color="secondary" onClick={() => setToggleSaveDialog(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

export default SBSaveFile;