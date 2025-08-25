import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";

interface SBSaveBuilderProps {
    fieldDefs: null | JSX.Element | JSX.Element[];
    customClass?: string;
}

const SBSaveBuilder = (props: SBSaveBuilderProps) => {
    const { fieldDefs, customClass } = props;

    const [fieldState, setFieldState] = useState(fieldDefs);
    const [fileNameInput, setFileNameInput] = useState('');
    const [toggleSaveDialog, setToggleSaveDialog] = useState(false);
    const [toggleOverwriteDialog, setToggleOverwriteDialog] = useState(false); //nestedModal
    const [isLoading, setIsLoading] = useState(false);

    return (
        <>
            <button type='button' id={'saveBuilder'}
                title={"Save Builder"}
                className={'btn btn-primary btn-sm ' + customClass}
                onClick={onSaveIconClick}>
                <FontAwesomeIcon icon={faSave} />
            </button>
            <div id="saveBuilderModal" className={`modal fade ${toggleSaveDialog ? 'show d-block' : 'd-none'}`}>

            </div>
        </>
    );
}

export default SBSaveBuilder;