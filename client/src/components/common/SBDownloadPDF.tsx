import React, { useState } from "react";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { sbToastError, sbToastInfo } from "./SBToast";

const SBDownloadPDF = (props: any) => {

    const { buttonId, data, customClass } = props;

    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleDownloadDialog, setToggleDownloadDialog] = useState(false);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFileNameInput(e.target.value);
    }

    const onDownloadClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (fileNameInput == '') {
            alert('Please enter a file name.');
            return;
        }
        const filename = `${fileNameInput}.pdf`;
        const dataObj = JSON.parse(data)
        try {
            fetch('/api/convert/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    schema: dataObj
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
        sbToastInfo('Downloading PDF...');
        setToggleDownloadDialog(false);
    }

    return (
        <>
            <Button id={buttonId || 'downloadPDF'} title="Download PDF" color="info" className={'btn-sm ' + customClass} onClick={() => setToggleDownloadDialog(true)}>
                <FontAwesomeIcon icon={faFilePdf} />
            </Button>

            <Modal isOpen={toggleDownloadDialog}>
                <ModalHeader>
                    Save PDF As...
                </ModalHeader>
                <ModalBody>
                    <div className="form-row">
                        <label htmlFor="filename" className="col-sm-4 col-form-label">File name:</label>
                        <div className="col-sm-8">
                            <Input id='filename' className="form-control" type="text" onChange={onChange}></Input>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="success" onClick={onDownloadClick}>Save</Button>
                    <Button color="secondary" onClick={() => setToggleDownloadDialog(false)}>Cancel</Button>
                </ModalFooter>
            </Modal>
        </>
    )
}
export default SBDownloadPDF;