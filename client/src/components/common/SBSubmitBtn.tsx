import React from "react";
import SBSpinner from "./SBSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const SBSubmitBtn = (props: any) => {

    const { buttonId, customClass, isLoading, isDisabled, buttonTitle, formId } = props;

    return (
        <>
            {isLoading ? <SBSpinner color={"success"} /> :
                <button 
                    id={buttonId || 'submitBtn'} 
                    type={'submit'} 
                    form={formId}
                    title={buttonTitle || "Submit"} 
                    className={'btn btn-sm btn-success border-0 ' + customClass} 
                    disabled={isDisabled}>
                    <FontAwesomeIcon icon={faPlay} />
                </button>
            }
        </>
    )
}
export default SBSubmitBtn;