import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "reactstrap";

const SBFileUploader = (props: any) => {
    const { id, accept, onChange, onCancel, ref } = props;
    let refs = ref;

    const onCancelClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        refs.value = '';
        onCancel();
    }

    return (
        <>
            <input type="file" id={id} name={id} accept={accept} onChange={onChange} ref={arg => refs = arg} className='form-control-sm' />
            <Button id="cancelFileUpload" color="secondary" size="sm" className="ml-0" onClick={onCancelClick} style={{ display: 'inline' }}>
                <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
            </Button>
        </>
    );
}

export default SBFileUploader;