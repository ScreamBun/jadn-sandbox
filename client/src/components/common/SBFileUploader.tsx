import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { forwardRef } from "react";

const SBFileUploader = forwardRef(function SBfileUploader(props: any, ref) {
    const { id, accept, onChange, onCancel, isMultiple } = props;

    return (
        <>
            <input type="file" id={id} name={id} accept={accept} onChange={onChange} ref={ref} multiple={isMultiple ? true : false} />
            <button id="cancelFileUpload" type='button' className="btn btn-sm btn-secondary ml-0" onClick={onCancel} style={{ display: 'inline' }}>
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
            </button>
        </>
    );
});

export default SBFileUploader;