import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { forwardRef } from "react";
import { Button } from "reactstrap";

const SBFileUploader = forwardRef(function SBfileUploader(props: any, ref) {
    const { id, accept, onChange, onCancel } = props;

    return (
        <>
            <input type="file" id={id} name={id} accept={accept} onChange={onChange} ref={ref} className='form-control-sm' />
            <Button id="cancelFileUpload" color="secondary" size="sm" className="ml-0" onClick={onCancel} style={{ display: 'inline' }}>
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
            </Button>
        </>
    );
});

export default SBFileUploader;