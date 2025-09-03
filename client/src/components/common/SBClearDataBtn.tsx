import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

interface SBClearDataBtnProps {
    onClick?: () => void;
}

const SBClearDataBtn = (props: SBClearDataBtnProps) => {

    return (
        <button
            type="button"
            className={'btn btn-sm'}
            title={'Clear Inputs'}
            onClick={props.onClick}
        >
            <FontAwesomeIcon icon={faTrash} />
        </button>
    );
}

export default SBClearDataBtn;