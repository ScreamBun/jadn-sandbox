import React from "react";
import SBSpinner from "./SBSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const SBSubmitBtn = (props: any) => {

    const { buttonId, buttonTxt, customClass, isLoading, isDisabled, buttonTitle, onBtnClick } = props;

    return (
        <>
            {isLoading ? <SBSpinner color={"success"} /> :
                <button 
                    id={buttonId || 'submitBtn'} 
                    type={'button'} 
                    title={buttonTitle || "Submit"} 
                    onClick={onBtnClick}
                    className={'btn btn-sm btn-success border-0 hoverSubmit ' + customClass} 
                    disabled={isDisabled}>
                        <span>{buttonTxt || "Submit"}</span>
                        <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            }                
        </>
    )
}
export default SBSubmitBtn;